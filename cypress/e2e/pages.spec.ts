/* eslint-disable func-names */
/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/// <reference types="cypress" />

import { withEmploymentInput } from '../../__tests__/testCases/withEmploymentInput'
import { withChildrenInput } from '../../__tests__/testCases/withChildrenInput'
import { baseInput } from '../../__tests__/testCases/baseInput'
import { with2percentInput } from '../../__tests__/testCases/with2percentInput'

import { TaxFormUserInput } from '../../src/types/TaxFormUserInput'
import { Route, PostponeRoute, homeRoute } from '../../src/lib/routes'
import { withPensionInput } from '../../__tests__/testCases/withPensionInput'
import { withPartnerInput } from '../../__tests__/testCases/withPartnerInput'
import { withBonusInput } from '../../__tests__/testCases/withBonusInput'
import { UserInput } from '../../src/types/UserInput'

function getInput<K extends keyof UserInput>(key: K, suffix = '') {
  return cy.get(`[data-test="${key}-input${suffix}"]`)
}

function typeToInput<K extends keyof TaxFormUserInput>(
  key: K,
  userInput: TaxFormUserInput,
) {
  const value = userInput[key]
  if (typeof value === 'string') {
    return getInput(key).type(value)
  }
  throw new Error(`Incorrect type of input: ${value}`)
}

const next = () => {
  return cy.contains('Pokračovať').click()
}

const getError = () => cy.get('[data-test=error]')
const assertUrl = (url: Route | PostponeRoute) => {
  cy.url().should('include', url)
}

const skipPage = () => {
  cy.get('.govuk-label').contains('Nie').click()
  next()
}

const navigateEligibleToChildrenPage = () => {
  cy.visit('/prijmy-a-vydavky')
  typeToInput('t1r10_prijmy', {
    ...withChildrenInput,
    t1r10_prijmy: '3876',
  })
  typeToInput('priloha3_r11_socialne', withChildrenInput)
  typeToInput('priloha3_r13_zdravotne', withChildrenInput)
  getInput('zaplatenePreddavky').type('0')

  next()

  assertUrl('/zamestnanie')
  skipPage()

  assertUrl('/partner')
  skipPage()
}

beforeEach(() => {
  cy.setCookie('you-shall', 'not-pass') // allow direct access to pages via URL
})

/** We don't use cookies for now */
describe.skip('Cookie consent', () => {
  it('has working ui', () => {
    // display cookie consent
    cy.visit(homeRoute)
    cy.get('.govuk-main-wrapper')
    cy.get('.cc-message').should('exist')
    cy.get('.cc-message').contains('Tento web používa súbory cookie')
    cy.get('.cc-banner button').contains('OK').click()
    cy.get('.cc-message').should('not.exist')

    // do not display cookie consent on next visit
    cy.visit(homeRoute)
    cy.get('.govuk-main-wrapper')
    cy.get('.cc-message').should('not.exist')
  })
})

describe('Employment page', () => {
  it('has working ui', () => {
    cy.visit('/zamestnanie')

    // Back button should work and be the correct page
    cy.get('[data-test=back]').click()
    assertUrl('/prijmy-a-vydavky')

    //  Go back to our page
    cy.visit('/zamestnanie')

    // Shows error, when presses next without interaction
    next()
    getError().should('have.length', 1)

    // When presses yes, additional fields appears
    cy.get('[data-test=employed-input-yes]').click()

    next()
    getError().should('have.length', 5)

    // Type to input
    typeToInput('uhrnPrijmovOdVsetkychZamestnavatelov', withEmploymentInput)

    next()
    getError().should('have.length', 4)

    typeToInput(
      'uhrnPovinnehoPoistnehoNaSocialnePoistenie',
      withEmploymentInput,
    )
    typeToInput(
      'uhrnPovinnehoPoistnehoNaZdravotnePoistenie',
      withEmploymentInput,
    )
    getInput('uhrnPreddavkovNaDan').type('0')
    getInput('udajeODanovomBonuseNaDieta').type('0')

    // When presses no, the fields disappear
    cy.get('[data-test=employed-input-no]').click()

    getInput('uhrnPrijmovOdVsetkychZamestnavatelov').should('not.exist')
    getInput('uhrnPovinnehoPoistnehoNaSocialnePoistenie').should('not.exist')
    getInput('uhrnPovinnehoPoistnehoNaZdravotnePoistenie').should('not.exist')

    // When presses yes, additional fields appears
    cy.get('[data-test=employed-input-yes]').click()

    getInput('uhrnPrijmovOdVsetkychZamestnavatelov').should(
      'have.value',
      withEmploymentInput?.uhrnPrijmovOdVsetkychZamestnavatelov?.toString(),
    )
    getInput('uhrnPovinnehoPoistnehoNaSocialnePoistenie').should(
      'have.value',
      withEmploymentInput?.uhrnPovinnehoPoistnehoNaSocialnePoistenie?.toString(),
    )
    getInput('uhrnPovinnehoPoistnehoNaZdravotnePoistenie').should(
      'have.value',
      withEmploymentInput?.uhrnPovinnehoPoistnehoNaZdravotnePoistenie?.toString(),
    )

    // Should submit and next page should be parter
    next()
    assertUrl('/partner')
  })
  it('should erase previous answers when answer is changed to "no"', () => {
    cy.visit('/zamestnanie')

    // fill out and submit the form
    getInput('employed', '-yes').click()
    typeToInput('uhrnPrijmovOdVsetkychZamestnavatelov', withEmploymentInput)
    typeToInput(
      'uhrnPovinnehoPoistnehoNaSocialnePoistenie',
      withEmploymentInput,
    )
    typeToInput(
      'uhrnPovinnehoPoistnehoNaZdravotnePoistenie',
      withEmploymentInput,
    )
    getInput('uhrnPreddavkovNaDan').type('10')
    getInput('udajeODanovomBonuseNaDieta').type('20')
    next()

    // go back
    assertUrl('/partner')
    cy.get('[data-test=back]').click()
    assertUrl('/zamestnanie')

    // form should preserve values when navigated back to it
    getInput('uhrnPrijmovOdVsetkychZamestnavatelov').should(
      'have.value',
      withEmploymentInput?.uhrnPrijmovOdVsetkychZamestnavatelov?.toString(),
    )
    getInput('uhrnPovinnehoPoistnehoNaSocialnePoistenie').should(
      'have.value',
      withEmploymentInput?.uhrnPovinnehoPoistnehoNaSocialnePoistenie?.toString(),
    )
    getInput('uhrnPovinnehoPoistnehoNaZdravotnePoistenie').should(
      'have.value',
      withEmploymentInput?.uhrnPovinnehoPoistnehoNaZdravotnePoistenie?.toString(),
    )
    getInput('uhrnPreddavkovNaDan').should('have.value', '10')
    getInput('udajeODanovomBonuseNaDieta').should('have.value', '20')

    // form should hide
    getInput('employed', '-no').click()
    getInput('uhrnPrijmovOdVsetkychZamestnavatelov').should('not.exist')
    getInput('uhrnPovinnehoPoistnehoNaSocialnePoistenie').should('not.exist')
    getInput('uhrnPovinnehoPoistnehoNaZdravotnePoistenie').should('not.exist')
    getInput('uhrnPreddavkovNaDan').should('not.exist')
    getInput('udajeODanovomBonuseNaDieta').should('not.exist')

    // form should display and preserve values until it is submitted
    getInput('employed', '-yes').click()
    getInput('uhrnPrijmovOdVsetkychZamestnavatelov').should(
      'have.value',
      withEmploymentInput?.uhrnPrijmovOdVsetkychZamestnavatelov?.toString(),
    )
    getInput('uhrnPovinnehoPoistnehoNaSocialnePoistenie').should(
      'have.value',
      withEmploymentInput?.uhrnPovinnehoPoistnehoNaSocialnePoistenie?.toString(),
    )
    getInput('uhrnPovinnehoPoistnehoNaZdravotnePoistenie').should(
      'have.value',
      withEmploymentInput?.uhrnPovinnehoPoistnehoNaZdravotnePoistenie?.toString(),
    )
    getInput('uhrnPreddavkovNaDan').should('have.value', '10')
    getInput('udajeODanovomBonuseNaDieta').should('have.value', '20')

    // submit form
    getInput('employed', '-no').click()
    next()

    // go back
    assertUrl('/partner')
    cy.get('[data-test=back]').click()
    assertUrl('/zamestnanie')

    // form should no preserve answers because it was submitted with additional fields hidden
    getInput('employed', '-yes').click()
    getInput('uhrnPrijmovOdVsetkychZamestnavatelov').should('have.value', '')
    getInput('uhrnPovinnehoPoistnehoNaSocialnePoistenie').should(
      'have.value',
      '',
    )
    getInput('uhrnPovinnehoPoistnehoNaZdravotnePoistenie').should(
      'have.value',
      '',
    )
    getInput('uhrnPreddavkovNaDan').should('have.value', '')
    getInput('udajeODanovomBonuseNaDieta').should('have.value', '')
  })
})
describe('Partner page', () => {
  it('has working ui', () => {
    cy.visit('/partner')

    // Back button should work and be the correct page
    cy.get('[data-test=back]').click()
    assertUrl('/zamestnanie')

    //  Go back to our page
    cy.visit('/partner')

    // Shows error, when presses next without interaction
    next()
    getError().should('have.length', 1)

    // When presses no, can continue to next page
    cy.get('[data-test=r032_uplatnujem_na_partnera-input-no]').click()
    next()
    assertUrl('/dochodok')
  })

  it('determines eligibility', () => {
    cy.visit('/partner')

    // When presses yes, additional fields appears
    cy.get('[data-test=r032_uplatnujem_na_partnera-input-yes]').click()
    next()

    getInput('partner_spolocna_domacnost', '-yes').should('exist')

    // Should show error if not filled in
    next()
    getError().should('have.length', 1)

    // Click radio, continue to see ineligible message
    cy.get('[data-test=partner_spolocna_domacnost-input-no]').click()
    next()
    cy.get('[data-test=ineligible-message]').should('exist')

    // Go back and change answer, continue to see more fields
    cy.get('button').contains('Späť').click()
    cy.get('[data-test=partner_spolocna_domacnost-input-yes]').click()
    next()
    cy.get('[data-test=ineligible-message]').should('not.exist')
    getInput('partner_bonus_uplatneny', '-yes').should('exist')

    // Click radio, continue to see ineligible message
    cy.get('[data-test=partner_bonus_uplatneny-input-yes]').click()
    next()
    cy.get('[data-test=ineligible-message]').should('exist')

    // Go back and change answer, continue to see more fields
    cy.get('button').contains('Späť').click()
    cy.get('[data-test=partner_bonus_uplatneny-input-no]').click()
    next()
    cy.get('[data-test=ineligible-message]').should('not.exist')
    cy.get('[data-test="partner_podmienky.1-input"]').should('exist')

    // Continue to see ineligible message
    next()
    cy.get('[data-test=ineligible-message]').should('exist')

    // Go back and change answer, continue to see more fields
    cy.get('button').contains('Späť').click()
    cy.get('[data-test="partner_podmienky.1-input"]').click()
    next()

    getInput('r032_partner_vlastne_prijmy').should('exist')

    // Should show error if field is empty
    next()
    getError().should('have.length', 1)

    // Fill out input with incorrect value (too high), continue to see ineligible message
    typeToInput('r032_partner_vlastne_prijmy', {
      ...withPartnerInput,
      r032_partner_vlastne_prijmy: '5236',
    })
    next()
    cy.get('[data-test=ineligible-message]').should('exist')

    // Go back and change answer, continue to see more fields
    cy.get('button').contains('Späť').click()
    cy.get('[data-test=r032_partner_vlastne_prijmy-input]').clear()
    typeToInput('r032_partner_vlastne_prijmy', withPartnerInput)
    next()
    cy.get('[data-test=ineligible-message]').should('not.exist')

    getInput('r031_priezvisko_a_meno').should('exist')
    getInput('r031_rodne_cislo').should('exist')
    getInput('r032_partner_pocet_mesiacov').should('exist')

    // Continue to see error
    next()
    getError().should('have.length', 3)

    // Fill out the form and continue to next page
    typeToInput('r031_priezvisko_a_meno', withPartnerInput)
    typeToInput('r031_rodne_cislo', withPartnerInput)
    typeToInput('r032_partner_pocet_mesiacov', withPartnerInput)
    next()
    assertUrl('/dochodok')
  })
})

describe('osobne-udaje page', () => {
  it('Back and next', () => {
    cy.visit('/osobne-udaje')

    // Back button should work and be the correct page
    cy.get('[data-test=back]').click()
    assertUrl('/dochodok')

    //  Go back to our page
    cy.visit('/osobne-udaje')

    // Shows error, when presses next without interaction
    next()
    getError()
  })
  it('with autoform', () => {
    cy.visit('/osobne-udaje')

    /** With autoform */
    typeToInput('r001_dic', baseInput)
    typeToInput('r003_nace', baseInput)
    getInput('meno_priezvisko').type('urban ayurveda')

    cy.contains('PhDr. Pavel Urban, PhD., PhD. - AYURVÉDA').click() // use a name that needs to be parsed

    getInput('meno_priezvisko').should(
      'contain.value',
      'PhDr. Pavel Urban, PhD., PhD. - AYURVÉDA',
    )
    getInput('r006_titul').should('contain.value', 'PhDr. / PhD., PhD.')
    getInput('r004_priezvisko').should('contain.value', 'Urban')
    getInput('r005_meno').should('contain.value', 'Pavel')
    getInput('r007_ulica').should('contain.value', 'Clementisova')
    getInput('r008_cislo').should('contain.value', '1350/45')
    getInput('r009_psc').should('contain.value', '024 01')
    getInput('r010_obec').should('contain.value', 'Kysucké Nové Mesto')
    getInput('r011_stat').should('contain.value', 'Slovenská republika')

    next()
  })
  it('with NACE', () => {
    cy.visit('/osobne-udaje')

    /** With autoform */
    getInput('r003_nace').type('ryža')

    cy.contains('01120').click({ force: true })

    getInput('r003_nace').should('have.value', '01120 - Pestovanie ryže')
  })

  it('Manual entry', () => {
    cy.visit('/osobne-udaje')

    typeToInput('r001_dic', baseInput)
    typeToInput('r003_nace', baseInput)
    typeToInput('r005_meno', baseInput)
    typeToInput('r004_priezvisko', baseInput)
    typeToInput('r007_ulica', baseInput)
    typeToInput('r008_cislo', baseInput)
    typeToInput('r009_psc', baseInput)
    getInput('r010_obec').clear() // clear value from PSC autocomplete via Posta API
    typeToInput('r010_obec', baseInput)
    typeToInput('r011_stat', baseInput)

    next()
  })
})

describe('Children page', () => {
  it('has working ui for ineligible applicants', () => {
    cy.visit('/deti')
    cy.get('[data-test=ineligible-message]').should('exist')
  })
  it('has working navigation for ineligible applicants', () => {
    cy.visit('/partner')
    skipPage()
    assertUrl('/dochodok')
  })
  it('has working validation', () => {
    navigateEligibleToChildrenPage()
    assertUrl('/deti')

    next()
    getError()

    // When presses yes, additional fields appears
    getInput('hasChildren', '-yes').click()

    // Try to add 2nd child
    next()

    // Show errors when trying to add 2nd child
    getError().should('have.length', 2)

    // Enter child data
    cy.get('[data-test="children[0].priezviskoMeno-input"]').type(
      withChildrenInput.children?.[0]?.priezviskoMeno ?? '',
    )
    cy.get('[data-test="children[0].rodneCislo-input"]').type(
      withChildrenInput.children?.[0]?.rodneCislo ?? '',
    )

    next()
    assertUrl('/dochodok')
  })
  it('has working ui for adding children', () => {
    cy.visit('/prijmy-a-vydavky')
    typeToInput('t1r10_prijmy', { ...withChildrenInput, t1r10_prijmy: '3876' })
    typeToInput('priloha3_r11_socialne', withChildrenInput)
    typeToInput('priloha3_r13_zdravotne', withChildrenInput)
    getInput('zaplatenePreddavky').type('0')

    next()

    assertUrl('/zamestnanie')
    getInput('employed', '-yes').click()
    typeToInput('uhrnPrijmovOdVsetkychZamestnavatelov', {
      ...withChildrenInput,
      uhrnPrijmovOdVsetkychZamestnavatelov: '3876',
    }) // eligible via employment income
    typeToInput('uhrnPovinnehoPoistnehoNaSocialnePoistenie', {
      ...withChildrenInput,
      uhrnPovinnehoPoistnehoNaSocialnePoistenie: '600',
    })
    typeToInput('uhrnPovinnehoPoistnehoNaZdravotnePoistenie', {
      ...withChildrenInput,
      uhrnPovinnehoPoistnehoNaZdravotnePoistenie: '400',
    })
    typeToInput('uhrnPreddavkovNaDan', {
      ...withChildrenInput,
      uhrnPreddavkovNaDan: '0',
    }) // eligible via employment income
    typeToInput('udajeODanovomBonuseNaDieta', {
      ...withChildrenInput,
      udajeODanovomBonuseNaDieta: '0',
    })
    next()

    assertUrl('/partner')
    skipPage()

    assertUrl('/deti')

    // When presses yes, additional fields appears
    getInput('hasChildren', '-yes').click()

    // Try to add 2nd child
    cy.get('[data-test="add-child"]').click()

    // Show errors when trying to add 2nd child
    getError().should('have.length', 2)

    // Enter 1st child data
    cy.get('[data-test="children[0].priezviskoMeno-input"]').type(
      withChildrenInput.children?.[0]?.priezviskoMeno ?? '',
    )
    cy.get('[data-test="children[0].rodneCislo-input"]').type(
      withChildrenInput.children?.[0]?.rodneCislo ?? '',
    )

    // Add 2nd child
    cy.get('[data-test="add-child"]').click()

    next()

    // Show errors for 2nd child
    getError().should('have.length', 2)

    // Enter 2nd child data
    cy.get('[data-test="children[1].priezviskoMeno-input"]').type(
      withChildrenInput.children?.[1]?.priezviskoMeno ?? '',
    )
    cy.get('[data-test="children[1].rodneCislo-input"]').type(
      withChildrenInput.children?.[1]?.rodneCislo ?? '',
    )

    // Add 3rd child
    cy.get('[data-test="add-child"]').click()

    next()

    // Show errors for 3rd child
    getError().should('have.length', 2)

    // Remove 2rd child
    cy.get('[data-test="remove-child-2"]').click()

    next()
    assertUrl('/dochodok')
  })
  it('has working validation for child form months', () => {
    navigateEligibleToChildrenPage()
    assertUrl('/deti')

    // When presses yes, additional fields appears
    getInput('hasChildren', '-yes').click()

    // Enter invalid months (November - April)
    cy.get('[data-test="children[0].monthFrom-select"]').select('10')
    cy.get('[data-test="children[0].monthTo-select"]').select('3')

    // Try to add 2nd child
    next()

    // Should have error for invalid months
    getError().should('have.length', 3)

    // Enter valid months (November - April)
    cy.get('[data-test="children[0].monthFrom-select"]').select('3')
    cy.get('[data-test="children[0].monthTo-select"]').select('10')

    // Try to continue
    next()

    // Should not have error for invalid months
    getError().should('have.length', 2)

    // Check checkbox for whole year
    cy.get('[data-test="children[0].wholeYear-input"]').click()

    next()

    // Should not have error for invalid months
    getError().should('have.length', 2)
  })
})

describe('Pension page', () => {
  it('has working ui', () => {
    cy.visit('/dochodok')

    // Back button should work and be the correct page
    cy.get('[data-test=back]').click()
    assertUrl('/partner')

    //  Go back to our page
    cy.visit('/dochodok')

    // Shows error, when presses next without interaction
    next()
    getError().should('have.length', 1)

    // When presses no, continues to next page
    cy.get('[data-test=platil_prispevky_na_dochodok-input-no]').click()
    next()
    assertUrl('/osobne-udaje')

    //  Go back to our page
    cy.visit('/dochodok')

    // When presses yes, additional fields appear
    cy.get('[data-test=platil_prispevky_na_dochodok-input-yes]').click()

    // All aditional fields should be required
    next()
    getError().should('have.length', 1)

    typeToInput('zaplatene_prispevky_na_dochodok', withPensionInput)

    next()
    assertUrl('/osobne-udaje')
  })
})

describe('twoPercent page', () => {
  it('has working ui', () => {
    cy.visit('/dve-percenta')

    // Shows error, when presses next without interaction
    next()
    getError().should('have.length', 1)

    // When presses yes, additional fields appear
    cy.get('[data-test=XIIoddiel_uplatnujem2percenta-input-yes]').click()

    // All aditional fields should be required
    next()
    getError().should('have.length', 2)

    // Type to input
    typeToInput('r142_obchMeno', with2percentInput)
    typeToInput('r142_ico', with2percentInput)
    cy.get('[data-test="XIIoddiel_suhlasZaslUdaje-input"]').click()

    next()
    assertUrl(homeRoute) // TODO: goes to home route because user should not be here (not eligible to donate to NGO)
  })
  it('with autoform', () => {
    cy.visit('/dve-percenta')

    // When presses yes, additional fields appear
    cy.get('[data-test=XIIoddiel_uplatnujem2percenta-input-yes]').click()

    /** With autoform */
    getInput('r142_obchMeno').type('Lifestarter')

    cy.contains('starter Trnava').click()

    getInput('r142_obchMeno').should('contain.value', 'Lifestarter')
    getInput('r142_ico').should('contain.value', '50718274')
    cy.get('[data-test="XIIoddiel_suhlasZaslUdaje-input"]').click()

    next()
    assertUrl(homeRoute) // TODO: goes to home route because user should not be here (not eligible to donate to NGO)
  })
  it('works with no', () => {
    cy.visit('/dve-percenta')

    cy.get('[data-test=XIIoddiel_uplatnujem2percenta-input-no]').click()
    next()
    getError().should('have.length', 0)

    assertUrl(homeRoute) // TODO: goes to home route because user should not be here (not eligible to donate to NGO)
  })
  it('works with Slovensko.Digital pre-fill', () => {
    cy.visit('/dve-percenta')
    cy.get('[data-test=prefill-slovensko-digital]').click()

    getInput('r142_obchMeno').should('contain.value', 'Slovensko.Digital')
    getInput('r142_ico').should('contain.value', '50 158 635')

    next()
    assertUrl(homeRoute) // TODO: goes to home route because user should not be here (not eligible to donate to NGO)
  })
})

describe('Feedback', () => {
  it('has working ui', () => {
    cy.visit(homeRoute)
    cy.get('[data-test=feedback]').click()
    cy.get('[data-test=submit]').click()
    getError().should('have.length', 2)

    getInput('email').type('foo')
    cy.get('[data-test=submit]').click()
    getError().should('have.length', 3)

    getInput('whatWereYouDoing').type('Cypress tests')
    getInput('whatWentWrong').type('Testing the spam')
    cy.get('[data-test=submit]').click()
    getError().should('have.length', 1)
    getError().contains('email')
  })
})

describe('Results page', () => {
  it('has working navigation', () => {
    cy.visit('/vysledky')

    // Back button should work and be the correct page
    cy.get('[data-test=back]').click()
    assertUrl('/suhrn')

    //  Go back to our page
    cy.visit('/vysledky')

    next()
    assertUrl('/pokracovat')
  })
  it('has working ui', () => {
    cy.visit('/vysledky')

    cy.get('h1').contains('Výpočet dane za rok')
    cy.get('h2').contains('Stručný prehľad')
  })
})

describe('IBAN page', () => {
  it('has working ui for ineligible applicants', () => {
    cy.visit('/iban')
    cy.get('[data-test=ineligible-message]').should('exist')
  })
  it('has working ui for eligible applicants', () => {
    cy.visit('/prijmy-a-vydavky')
    typeToInput('t1r10_prijmy', { ...withBonusInput, t1r10_prijmy: '3876' })
    typeToInput('priloha3_r11_socialne', withBonusInput)
    typeToInput('priloha3_r13_zdravotne', withBonusInput)
    getInput('zaplatenePreddavky').type('0')

    next()

    assertUrl('/zamestnanie')
    skipPage()

    assertUrl('/partner')
    skipPage()

    assertUrl('/deti')
    getInput('hasChildren', '-yes').click()
    cy.get('[data-test="children[0].priezviskoMeno-input"]').type(
      withBonusInput.children?.[0]?.priezviskoMeno ?? '',
    )
    cy.get('[data-test="children[0].rodneCislo-input"]').type(
      withBonusInput.children?.[0]?.rodneCislo ?? '',
    )
    next()

    assertUrl('/dochodok')
    skipPage()

    // assertUrl('/hypoteka')
    // skipPage()

    assertUrl('/osobne-udaje')
    typeToInput('r001_dic', withBonusInput)
    typeToInput('r003_nace', withBonusInput)
    typeToInput('r005_meno', withBonusInput)
    typeToInput('r004_priezvisko', withBonusInput)
    typeToInput('r007_ulica', withBonusInput)
    typeToInput('r008_cislo', withBonusInput)
    typeToInput('r009_psc', withBonusInput)
    getInput('r010_obec').clear() // clear value from PSC autocomplete via Posta API
    typeToInput('r010_obec', withBonusInput)
    typeToInput('r011_stat', withBonusInput)
    next()

    assertUrl('/suhrn')
    next()

    assertUrl('/iban')
    cy.get('[data-test=ineligible-message]').should('not.exist')
    next()

    getError().should('have.length', 1)

    getInput('ziadamVyplatitDanovyBonus', '-no').click()
    next()
    getError().should('have.length', 0)

    assertUrl('/vysledky')
    cy.get('.govuk-back-link').click()
    getError().should('have.length', 0)

    getInput('ziadamVyplatitDanovyBonus', '-yes').click()
    getInput('iban').should('exist')
    next()

    getError().should('have.length', 1)

    getInput('iban').type('SK6807200002891987426353')
    next()
    assertUrl('/vysledky')
  })
})

describe('Summary page', () => {
  it('has working navigation', () => {
    cy.visit('/suhrn')

    // Back button should work and be the correct page
    cy.get('[data-test=back]').click()
    assertUrl('/osobne-udaje')

    //  Go back to our page
    cy.visit('/vysledky')
  })
  it('has working ui', () => {
    cy.visit('/suhrn')

    cy.get('h1').contains('Súhrn a kontrola vyplnených údajov')
    cy.get('h2').contains('Príjmy a odvody')
  })
  it('displays correct first & last name', () => {
    cy.visit('/osobne-udaje')

    getInput('meno_priezvisko').type('Ján Jan')
    cy.contains('Ján Janušík').click()
    getInput('meno_priezvisko').clear()
    getInput('meno_priezvisko').type('Jozef Mrkva') // write different name into search input
    next()

    assertUrl('/suhrn')
    cy.get('[data-test=r005_meno]').contains('Ján')
    cy.get('[data-test=r004_priezvisko]').contains('Janušík')
  })
  ;[
    '/prijmy-a-vydavky',
    '/zamestnanie',
    '/partner',
    '/deti',
    '/dochodok',
    // '/hypoteka',
    '/osobne-udaje',
  ].forEach((link: Route, index) => {
    it(`has working edit link to ${link}`, () => {
      cy.visit('/suhrn')
      cy.get('h2 > a').eq(index).click()
      assertUrl(link)

      // Back button should navigate back to summary page
      cy.get('[data-test=back]').click()
      cy.visit('/suhrn')
    })
  })
})