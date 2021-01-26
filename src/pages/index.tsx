import React from 'react'
import { Warning } from '../components/Warning'
import { ExternalLink } from '../components/ExternalLink'
import styles from './domov.module.css'
import Link from 'next/link'

const Index = ({ nextPostponeRoute }) => (
  <>
    <div className="govuk-grid-column-two-thirds">
      <WorkInProgressSection />
    </div>

    <div className="govuk-grid-column-one-third">
      <div className={styles.postponeBox}>
        <PostponeSection nextPostponeRoute={nextPostponeRoute} />
      </div>
    </div>
  </>
)

export default Index

const PostponeSection = ({ nextPostponeRoute }) => (
  <>
    <h2 className="govuk-heading-m govuk-!-margin-top-3">
      Odklad daňového priznania
    </h2>
    <p>
      Riadny termín pre podanie daňového priznania a zaplatenie dane je 31.3.
    </p>
    <p>Termín si viete predĺžiť:</p>
    <ul className="govuk-list govuk-list--bullet">
      <li>do 30.6. ak ste mali príjmy len zo Slovenska, alebo</li>
      <li>do 30.9. ak ste mali príjmy aj zo zahraničia</li>
    </ul>

    <Link href={nextPostponeRoute}>
      <button
        type="button"
        className="btn-secondary govuk-button govuk-button--large"
      >
        Odložiť daňové priznanie
      </button>
    </Link>
  </>
)

const WorkInProgressSection = () => {
  const navodyUrl =
    'https://navody.digital/zivotne-situacie/elektronicke-podanie-danoveho-priznania'

  return (
    <>
      <h1 className="govuk-heading-l govuk-!-margin-top-3">
        Vyplnenie daňového priznania
        <br />
        (verzia pre rok 2020)
      </h1>

      <Warning>Na verzii pre rok 2020 aktuálne pracujeme.</Warning>

      <p>
        Viac informácii nájdete na{' '}
        <ExternalLink href={navodyUrl}>navody.digital</ExternalLink>, kde nám
        môžete zanechať svoj email a my sa postaráme, aby vám nič neuniklo.
      </p>

      <p>
        Dáme vám vedieť hneď, ako bude dostupná verzia aplikácie na tento rok.
        Nebojte sa, všetko v pohode stíhate :)
      </p>

      <p>
        <ExternalLink
          href={navodyUrl}
          className="govuk-button govuk-button--large"
        >
          Viac informácí
        </ExternalLink>
      </p>
    </>
  )
}
