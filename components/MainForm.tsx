import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { calculate, initTaxFormUserInputValues } from "../lib/calculation";
import styles from "./MainForm.module.css";
import { TaxForm, TaxFormUserInput } from "../lib/types";
import * as Yup from "yup";

const mainFormSchema = Yup.object().shape({
  // Zatial bez validacie, aby nepodstatne fieldy nezdrzovali
  // r005_meno: Yup.string().required("Pole je povinné."),
  // r004_priezvisko: Yup.string().required("Pole je povinné."),
});

const MainForm = () => {
  const [taxForm, setTaxForm] = useState<TaxForm>({});
  const initialValues: TaxFormUserInput = {
    ...initTaxFormUserInputValues,
    t1r10_prijmy: 20000,
    priloha3_r11_socialne: 1000,
    priloha3_r13_zdravotne: 1000,
  };
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values => {
        setTaxForm(calculate(values));
      }}
      validationSchema={mainFormSchema}
    >
      {({ values }) => (
        <Form className={styles.form}>
          <h2>Údaje o daňovníkovi</h2>
          <label htmlFor="r001_dic">DIČ</label>
          <Field name="r001_dic" type="text" />

          <label htmlFor="r002_datum_narodenia">Dátum narodenia</label>
          <Field name="r002_datum_narodenia" type="text" />

          <label htmlFor="r005_meno">Meno</label>
          <Field name="r005_meno" type="text" />
          <ErrorMessage name="r005_meno" />

          <label htmlFor="r004_priezvisko">Priezvisko</label>
          <Field name="r004_priezvisko" type="text" />
          <ErrorMessage name="r004_priezvisko" />

          <h3>Adresa trvalého pobytu</h3>
          <label htmlFor="r007_ulica">Ulica</label>
          <Field name="r007_ulica" type="text" />
          <label htmlFor="r008_cislo">Súpisné/orientačné číslo</label>
          <Field name="r008_cislo" type="text" />
          <label htmlFor="r009_psc">PSČ</label>
          <Field name="r009_psc" type="text" />
          <label htmlFor="r010_mesto">Mesto</label>
          <Field name="r010_mesto" type="text" />
          <label htmlFor="r011_stat">Štát</label>
          <Field name="r011_stat" type="text" />
          <label htmlFor="t1r10_prijmy">Prijem</label>

          <h2>Prijmy vydavky</h2>
          <Field name="t1r10_prijmy" type="number" />
          <label htmlFor="priloha3_r11_socialne">Socialne poistenie</label>
          <Field name="priloha3_r11_socialne" type="number" />
          <label htmlFor="priloha3_r13_zdravotne">Zdravotne poistenie</label>
          <Field name="priloha3_r13_zdravotne" type="number" />

          <h2>Partner</h2>
          <label htmlFor="r007_ulica">Uplatnujem na partnera</label>
          <Field name="r032_uplatnujem_na_partnera" type="checkbox" />
          {values.r032_uplatnujem_na_partnera && (
            <>
              <label htmlFor="r031_priezvisko_a_meno">Prizevisko a meno</label>
              <Field name="r031_priezvisko_a_meno" type="text" />

              <label htmlFor="r031_rodne_cislo">Rodne cislo</label>
              <Field name="r031_rodne_cislo" type="text" />

              <label htmlFor="r032_partner_vlastne_prijmy">
                Vlastne prijmy
              </label>
              <Field name="r032_partner_vlastne_prijmy" type="number" />

              <label htmlFor="r032_partner_pocet_mesiacov">
                Pocet mesiacov
              </label>
              <Field name="r032_partner_pocet_mesiacov" type="number" />

              <label htmlFor="r033_partner_kupele">Partner kupele</label>
              <Field name="r033_partner_kupele" type="checkbox" />
              {values.r033_partner_kupele && (
                <>
                  <label htmlFor="r033_partner_kupele_uhrady">
                    Partner kupele uhrady
                  </label>
                  <Field name="r033_partner_kupele_uhrady" type="number" />
                </>
              )}
            </>
          )}

          <button type="submit">Submit</button>
          <h2>Vysledky</h2>
          <div className={styles.summary}>
            <div>Základ dane: {taxForm.r080_zaklad_dane_celkovo} </div>
            <div>Daň: {taxForm.r105_dan}</div>
            <div>Daň na úhradu: {taxForm.r125_dan_na_uhradu}</div>
            <div>Daňový preplatok: {taxForm.r126_danovy_preplatok}</div>
          </div>
          <pre>{JSON.stringify(taxForm, null, 2)}</pre>
        </Form>
      )}
    </Formik>
  );
};

export default MainForm;