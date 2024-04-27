import { E2eTestUserInput } from '../../src/types/E2eTestUserInput'

export const bugReport3Input: E2eTestUserInput = {
  t1r10_prijmy: '45000',
  priloha3_r11_socialne: '1000',
  priloha3_r13_zdravotne: '1000',
  zaplatenePreddavky: '100',
  r031_priezvisko_a_meno: 'anon',
  r031_rodne_cislo: 'anon',
  r032_uplatnujem_na_partnera: false,
  partner_step: 0,
  partner_podmienky: {},
  r032_partner_vlastne_prijmy: '',
  r032_partner_pocet_mesiacov: '',
  r001_dic: 'anon',
  r003_nace: 'anon',
  meno_priezvisko: 'anon',
  r005_meno: 'anon',
  r004_priezvisko: 'anon',
  r006_titul: '',
  r007_ulica: 'anon',
  r008_cislo: 'anon',
  r009_psc: 'anon',
  r010_obec: 'anon',
  r011_stat: 'anon',
  employed: true,
  uhrnPrijmovOdVsetkychZamestnavatelov: '2000',
  uhrnPovinnehoPoistnehoNaSocialnePoistenie: '150',
  uhrnPovinnehoPoistnehoNaZdravotnePoistenie: '50',
  udajeODanovomBonuseNaDieta: '0',
  uhrnPreddavkovNaDan: '10',
  hasChildren: true,
  children: [
    {
      id: 1,
      priezviskoMeno: 'anon',
      rodneCislo: '000205/6901',

      wholeYear: true,
      monthFrom: '0',
      monthTo: '11',
    },
    {
      id: 2,
      priezviskoMeno: 'anon',
      rodneCislo: '990216/8452',

      wholeYear: true,
      monthFrom: '0',
      monthTo: '11',
    },
  ],
  platil_prispevky_na_dochodok: true,
  zaplatene_prispevky_na_dochodok: '100',
  expectNgoDonationValue: true,
  XIIoddiel_uplatnujem2percenta: false,
  r142_ico: '',
  r142_obchMeno: '',
  XIIoddiel_suhlasZaslUdaje: false,
  iban: 'anon',
  datum: '',
  ...{
    r001_dic: '233123123',
    r003_nace: '62010 - Počítačové programovanie',
    r007_ulica: 'Mierova',
    r008_cislo: '4',
    r009_psc: '82105',
    r010_obec: 'Bratislava 3',
    r011_stat: 'Slovensko',
    datum: '22.02.2020',
    r004_priezvisko: 'anon',
    r005_meno: 'anon',
  },

  percent2: '37,62',
  percent3: '72,79',
}
