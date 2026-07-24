import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const LANGUAGES = ["en", "ja", "ko", "fr", "de"];
const PACKS = ["basic-vocabulary", "dates", "numbers", "time"];

const TRANSLATIONS = {
  "basic-vocabulary": {
    en: rows(`
study|/ˈstʌdi/
work|/wɝːk/
meeting|/ˈmiːtɪŋ/
appointment|/əˈpɔɪntmənt/
preparation|/ˌprɛpəˈreɪʃən/
experience|/ɪkˈspɪriəns/
explanation|/ˌɛkspləˈneɪʃən/
schedule|/ˈskɛdʒuːl/
consultation|/ˌkɑːnsəlˈteɪʃən/
contact|/ˈkɑːntækt/
confirmation|/ˌkɑːnfɚˈmeɪʃən/
overtime|/ˈoʊvɚtaɪm/
lateness|/ˈleɪtnəs/
business trip|/ˈbɪznəs trɪp/
report|/rɪˈpɔːrt/
weather|/ˈwɛðɚ/
shopping|/ˈʃɑːpɪŋ/
cooking|/ˈkʊkɪŋ/
travel|/ˈtrævəl/
photograph|/ˈfoʊtəɡræf/
movie|/ˈmuːvi/
music|/ˈmjuːzɪk/
exercise|/ˈɛksɚsaɪz/
hospital|/ˈhɑːspɪtəl/
medicine|/ˈmɛdəsən/
habit|/ˈhæbɪt/
feeling|/ˈfiːlɪŋ/
mood|/muːd/
all right|/ˌɔːl ˈraɪt/
convenient|/kənˈviːniənt/`),
    fr: terms(`étude
travail
réunion
rendez-vous
préparation
expérience
explication
programme
consultation
contact
confirmation
heures supplémentaires
retard
voyage d’affaires
rapport
temps
courses
cuisine
voyage
photo
film
musique
exercice
hôpital
médicament
habitude
sentiment
humeur
ça va
pratique`),
    de: terms(`Lernen
Arbeit
Besprechung
Termin
Vorbereitung
Erfahrung
Erklärung
Zeitplan
Beratung
Kontakt
Bestätigung
Überstunden
Verspätung
Dienstreise
Bericht
Wetter
Einkaufen
Kochen
Reise
Foto
Film
Musik
Sport
Krankenhaus
Medikament
Gewohnheit
Gefühl
Stimmung
in Ordnung
praktisch`),
  },
  dates: {
    en: rows(`
today|/təˈdeɪ/
tomorrow|/təˈmɑːroʊ/
yesterday|/ˈjɛstɚdeɪ/
the day after tomorrow|/ðə deɪ ˈæftɚ təˈmɑːroʊ/
the day before yesterday|/ðə deɪ bɪˈfɔːr ˈjɛstɚdeɪ/
every day|/ˈɛvri deɪ/
this week|/ðɪs wiːk/
last week|/læst wiːk/
next week|/nɛkst wiːk/
this month|/ðɪs mʌnθ/
last month|/læst mʌnθ/
next month|/nɛkst mʌnθ/
this year|/ðɪs jɪr/
last year|/læst jɪr/
next year|/nɛkst jɪr/
Monday|/ˈmʌndeɪ/
Tuesday|/ˈtuːzdeɪ/
Wednesday|/ˈwɛnzdeɪ/
Thursday|/ˈθɝːzdeɪ/
Friday|/ˈfraɪdeɪ/
Saturday|/ˈsætɚdeɪ/
Sunday|/ˈsʌndeɪ/
weekend|/ˌwiːkˈɛnd/
day of the week|/deɪ əv ðə wiːk/
date|/deɪt/
birthday|/ˈbɝːθdeɪ/
public holiday|/ˈpʌblɪk ˈhɑːlədeɪ/`),
    fr: terms(`aujourd’hui
demain
hier
après-demain
avant-hier
tous les jours
cette semaine
la semaine dernière
la semaine prochaine
ce mois-ci
le mois dernier
le mois prochain
cette année
l’année dernière
l’année prochaine
lundi
mardi
mercredi
jeudi
vendredi
samedi
dimanche
week-end
jour de la semaine
date
anniversaire
jour férié`),
    de: terms(`heute
morgen
gestern
übermorgen
vorgestern
jeden Tag
diese Woche
letzte Woche
nächste Woche
dieser Monat
letzter Monat
nächster Monat
dieses Jahr
letztes Jahr
nächstes Jahr
Montag
Dienstag
Mittwoch
Donnerstag
Freitag
Samstag
Sonntag
Wochenende
Wochentag
Datum
Geburtstag
Feiertag`),
  },
  numbers: {
    en: rows(`
one|/wʌn/
two|/tuː/
three|/θriː/
four|/fɔːr/
five|/faɪv/
six|/sɪks/
seven|/ˈsɛvən/
eight|/eɪt/
nine|/naɪn/
ten|/tɛn/
one hundred|/wʌn ˈhʌndrəd/
one thousand|/wʌn ˈθaʊzənd/
ten thousand|/tɛn ˈθaʊzənd/
one hundred million|/wʌn ˈhʌndrəd ˈmɪljən/
one item|/wʌn ˈaɪtəm/
two items|/tuː ˈaɪtəmz/
three items|/θriː ˈaɪtəmz/
half|/hæf/
number|/ˈnʌmbɚ/
identification number|/aɪˌdɛntəfəˈkeɪʃən ˈnʌmbɚ/
items|/ˈaɪtəmz/
people|/ˈpiːpəl/
times|/taɪmz/
years old|/jɪrz oʊld/
yen|/jɛn/`),
    fr: terms(`un
deux
trois
quatre
cinq
six
sept
huit
neuf
dix
cent
mille
dix mille
cent millions
un objet
deux objets
trois objets
moitié
nombre
numéro
objets
personnes
fois
ans
yens`),
    de: terms(`eins
zwei
drei
vier
fünf
sechs
sieben
acht
neun
zehn
hundert
tausend
zehntausend
hundert Millionen
ein Gegenstand
zwei Gegenstände
drei Gegenstände
Hälfte
Anzahl
Nummer
Gegenstände
Personen
Mal
Jahre alt
Yen`),
  },
  time: {
    en: rows(`
time|/taɪm/
o’clock|/əˈklɑːk/
minute|/ˈmɪnɪt/
second|/ˈsɛkənd/
half past|/hæf pæst/
a.m.|/ˌeɪ ˈɛm/
p.m.|/ˌpiː ˈɛm/
morning|/ˈmɔːrnɪŋ/
noon|/nuːn/
night|/naɪt/
evening|/ˈiːvnɪŋ/
late at night|/leɪt æt naɪt/
now|/naʊ/
what time|/wʌt taɪm/
clock|/klɑːk/
early|/ˈɝːli/
late|/leɪt/
lunch break|/lʌntʃ breɪk/
deadline|/ˈdɛdlaɪn/
soon|/suːn/`),
    fr: terms(`temps
heure
minute
seconde
et demie
du matin
de l’après-midi
matin
midi
nuit
soir
tard dans la nuit
maintenant
quelle heure
horloge
tôt
tard
pause déjeuner
date limite
bientôt`),
    de: terms(`Zeit
Uhr
Minute
Sekunde
halb
vormittags
nachmittags
Morgen
Mittag
Nacht
Abend
spät in der Nacht
jetzt
wie spät
Uhr
früh
spät
Mittagspause
Frist
bald`),
  },
};

const LANGUAGE_NAMES = {
  en: { en: "English", ja: "Japanese", ko: "Korean", fr: "French", de: "German" },
  ja: { en: "英語", ja: "日本語", ko: "韓国語", fr: "フランス語", de: "ドイツ語" },
  ko: { en: "영어", ja: "일본어", ko: "한국어", fr: "프랑스어", de: "독일어" },
};

const FRENCH_ADJECTIVES = {
  "basic-vocabulary": {
    en: "anglais", ja: "japonais", ko: "coréen", fr: "français", de: "allemand",
  },
  dates: {
    en: "anglaises", ja: "japonaises", ko: "coréennes", fr: "françaises", de: "allemandes",
  },
  numbers: {
    en: "anglais", ja: "japonais", ko: "coréens", fr: "français", de: "allemands",
  },
  time: {
    en: "anglaises", ja: "japonaises", ko: "coréennes", fr: "françaises", de: "allemandes",
  },
};

const GERMAN_ADJECTIVES = {
  "basic-vocabulary": {
    en: "Englischer", ja: "Japanischer", ko: "Koreanischer", fr: "Französischer", de: "Deutscher",
  },
  other: {
    en: "Englische", ja: "Japanische", ko: "Koreanische", fr: "Französische", de: "Deutsche",
  },
};

const LANGUAGE_NOUNS = {
  en: { en: "English", ja: "Japanese", ko: "Korean", fr: "French", de: "German" },
  ja: { en: "英語", ja: "日本語", ko: "韓国語", fr: "フランス語", de: "ドイツ語" },
  ko: { en: "영어", ja: "일본어", ko: "한국어", fr: "프랑스어", de: "독일어" },
  fr: { en: "anglais", ja: "japonais", ko: "coréen", fr: "français", de: "allemand" },
  de: { en: "Englisch", ja: "Japanisch", ko: "Koreanisch", fr: "Französisch", de: "Deutsch" },
};

const LOCALIZED_DESCRIPTIONS = {
  "basic-vocabulary": {
    en: "A starter collection of common {language} words for everyday study.",
    ja: "日常学習でよく使う{language}の単語を集めた入門単語パックです。",
    ko: "일상 학습에 자주 쓰는 {language} 단어를 모은 기초 단어팩입니다.",
    fr: "Une sélection de mots courants en {language} pour débuter.",
    de: "Eine Sammlung häufiger Wörter auf {language} für den Einstieg.",
  },
  dates: {
    en: "{language} words for days, weeks, months, years, and relative dates.",
    ja: "日・週・月・年と相対的な日付を表す{language}の単語集です。",
    ko: "일, 주, 월, 연도와 상대 날짜를 나타내는 {language} 단어 모음입니다.",
    fr: "Les mots en {language} pour les jours, semaines, mois, années et dates relatives.",
    de: "Wörter auf {language} für Tage, Wochen, Monate, Jahre und relative Datumsangaben.",
  },
  numbers: {
    en: "Common {language} numbers and counting expressions for beginner study.",
    ja: "初級学習者向けの{language}の数字と数え方を集めています。",
    ko: "초급 학습자를 위한 {language} 숫자와 수 표현 모음입니다.",
    fr: "Les nombres et expressions de comptage courants en {language} pour débuter.",
    de: "Häufige Zahlen und Zählausdrücke auf {language} für den Einstieg.",
  },
  time: {
    en: "Common {language} words and expressions for discussing time.",
    ja: "時刻や時間について話すときによく使う{language}の単語と表現です。",
    ko: "시간을 말하고 이야기할 때 자주 쓰는 {language} 단어와 표현 모음입니다.",
    fr: "Les mots et expressions courants en {language} pour parler du temps et de l’heure.",
    de: "Häufige Wörter und Ausdrücke auf {language}, um über Zeit und Uhrzeit zu sprechen.",
  },
};

const TOPICS = {
  "basic-vocabulary": {
    en: "Basic Vocabulary", ja: "の基礎語彙", ko: " 기초 어휘",
    fr: "Vocabulaire de base ", de: " Grundwortschatz",
    description: "A starter collection of common {language} words for everyday study.",
    tags: ["basics", "daily-life"],
  },
  dates: {
    en: "Dates", ja: "の日付", ko: " 날짜", fr: "Dates ", de: " Datumsangaben",
    description: "{language} words for days, weeks, months, years, and relative dates.",
    tags: ["basics", "dates", "time"],
  },
  numbers: {
    en: "Numbers", ja: "の数字", ko: " 숫자", fr: "Nombres ", de: " Zahlen",
    description: "Common {language} numbers and counting expressions for beginner study.",
    tags: ["basics", "numbers"],
  },
  time: {
    en: "Time Expressions", ja: "の時間表現", ko: " 시간 표현",
    fr: "Expressions temporelles ", de: " Zeitausdrücke",
    description: "Common {language} words and expressions for discussing time.",
    tags: ["basics", "time"],
  },
};

const originals = {};
for (const packName of PACKS) {
  originals[packName] = JSON.parse(
    await readFile(`packs/ko-ja/basics/${packName}.json`, "utf8"),
  );
  const originalWords = originals[packName].words;
  TRANSLATIONS[packName].ja = originalWords.map(({ term, reading }) => ({
    term,
    reading,
  }));
  TRANSLATIONS[packName].ko = originalWords.map(({ meaning }) => ({
    term: meaning,
    reading: meaning,
  }));
}

for (const packName of PACKS) {
  const expected = originals[packName].words.length;
  for (const language of LANGUAGES) {
    if (TRANSLATIONS[packName][language].length !== expected) {
      throw new Error(`${packName}/${language} must contain ${expected} entries`);
    }
  }
}

for (const sourceLanguage of LANGUAGES) {
  for (const targetLanguage of LANGUAGES) {
    if (sourceLanguage === targetLanguage) continue;

    for (const packName of PACKS) {
      if (sourceLanguage === "ko" && targetLanguage === "ja") continue;

      const topic = TOPICS[packName];
      const targetName = LANGUAGE_NAMES.en[targetLanguage];
      const pack = {
        sourceLanguage,
        targetLanguage,
        name: `${targetName} ${topic.en}`,
        description: topic.description.replace("{language}", targetName),
        tags: topic.tags,
        localizations: Object.fromEntries(
          LANGUAGES.map((language) => [
            language,
            {
              name: localizedName(language, targetLanguage, topic, packName),
              description: localizedDescription(
                language,
                targetLanguage,
                packName,
              ),
            },
          ]),
        ),
        words: TRANSLATIONS[packName][targetLanguage].map((target, index) => ({
          term: target.term,
          reading: target.reading,
          meaning: TRANSLATIONS[packName][sourceLanguage][index].term,
        })),
      };

      const directory = `packs/${sourceLanguage}-${targetLanguage}/basics`;
      await mkdir(directory, { recursive: true });
      await writeFile(
        path.join(directory, `${packName}.json`),
        `${JSON.stringify(pack, null, 2)}\n`,
      );
    }
  }
}

function localizedName(language, targetLanguage, topic, packName) {
  if (language === "fr") {
    return `${topic.fr}${FRENCH_ADJECTIVES[packName][targetLanguage]}`;
  }
  if (language === "de") {
    const adjectives =
      packName === "basic-vocabulary"
        ? GERMAN_ADJECTIVES["basic-vocabulary"]
        : GERMAN_ADJECTIVES.other;
    return `${adjectives[targetLanguage]}${topic.de}`;
  }
  const target = LANGUAGE_NAMES[language][targetLanguage];
  if (language === "en") return `${target} ${topic.en}`;
  if (language === "ja") return `${target}${topic.ja}`;
  return `${target}${topic.ko}`;
}

function localizedDescription(language, targetLanguage, packName) {
  return LOCALIZED_DESCRIPTIONS[packName][language].replace(
    "{language}",
    LANGUAGE_NOUNS[language][targetLanguage],
  );
}

function rows(value) {
  return value.trim().split("\n").map((line) => {
    const [term, reading] = line.split("|");
    return { term, reading };
  });
}

function terms(value) {
  return value.trim().split("\n").map((term) => ({ term, reading: term }));
}
