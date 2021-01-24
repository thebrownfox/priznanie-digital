import { NextApiRequest, NextApiResponse } from 'next'
import {
  makeAttachment,
  sendEmail,
  createOrUpdateContact,
  PostponeTemplateParams,
} from '../../lib/sendinblue'
import { setDate } from '../../lib/utils'
import { PostponeUserInput } from '../../types/PostponeUserInput'
import { convertPostponeToXML } from '../../lib/postpone/postponeConverter'
import { fetchPostForm } from '../../lib/fetch'

const contactListId = Number.parseInt(process.env.sendinblue_list_id, 10)

export default async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  const email = `${req.body.email}`
  const params = req.body.params as PostponeTemplateParams
  const templateId = Number.parseInt(process.env.sendinblue_tpl_postpone, 10)
  const postponeUserInput: PostponeUserInput = req.body.postponeUserInput

  if (!email || !params || !postponeUserInput) {
    res.statusCode = 400
    return res.send({ message: 'Invalid params' })
  }

  const attachmentXml = convertPostponeToXML(setDate(postponeUserInput))

  try {
    // const sendEmailResponse = await sendEmail({
    //   templateId,
    //   to: email,
    //   params,
    //   attachment: [makeAttachment('danove_priznanie.xml', attachmentXml)],
    // })

    // if (sendEmailResponse.ok && params.newsletter) {
    if (params.newsletter) {
      // save to sendinblue contact list directly
      const { firstName, lastName } = params
      const contactResponse = await createOrUpdateContact({
        email,
        firstName,
        lastName,
        listIds: [contactListId],
      })
      if (!contactResponse.ok) {
        res.statusCode = contactResponse.status
        return res.send(contactResponse)
      }

      const encodedEmail = encodeURIComponent(email)

      // submit slovensko.digital newsletter form
      const sdResult = await fetchPostForm(
        'https://my.sendinblue.com/users/subscribeembed/js_id/29wti/id/1',
        `js_id=29wti&listid=2%7C5&from_url=yes&hdn_email_txt=&email=${encodedEmail}`,
      )
      const sdBody = await sdResult.json()
      console.log('sdBody', sdBody.result, sdBody[`${sdBody.result}_msg`])

      // try to submit navody.digital newsletter form (broken, bad approach)
      const navodyForm = await fetch('https://navody.digital/notifikacie')
      const navodyFormBody = await navodyForm.text()
      const csrfTokenMatch = navodyFormBody.match(
        /<meta name="csrf-token" content="(.+)"/,
      )
      const csrfToken = csrfTokenMatch && csrfTokenMatch[1]

      if (!csrfToken) {
        res.statusCode = 500
        return res.send({ message: 'Chyba newslettera (csrf)' })
      }

      const navodyResult = await fetchPostForm(
        'https://navody.digital/notifikacie',
        [
          `authenticity_token=${encodeURIComponent(csrfToken)}`,
          'notification_subscription_group[subscription_types][]=NewsletterSubscription',
          'notification_subscription_group[subscription_types][]=VoteSubscription',
          'notification_subscription_group[subscription_types][]=CompanyNewsletterSubscription',
          'notification_subscription_group[subscription_types][]=NGOSubscription',
          'notification_subscription_group[subscriptions][]=SelfEmployedSubscription',
          'notification_subscription_group[subscription_types][]=SelfEmployedSubscription',
          'notification_subscription_group[subscription_types][]=CarOwnerSubscription',
          `notification_subscription_group[email]=${encodedEmail}`,
          'commit=Chcem%20dost%C3%A1va%C5%A5%20tieto%20notifik%C3%A1cie',
        ].join('&'),
        {
          'x-csrf-token': csrfToken,
        },
      )
      console.log('navodyResult', navodyResult)

      res.statusCode = navodyResult.status
      return res.send({})
    }

    // res.statusCode = sendEmailResponse.status
    // return res.send({ ...(await sendEmailResponse.json()) })
  } catch (error) {
    console.error(error)
    res.statusCode = 500
    return res.send({ message: error.message })
  }
}
