# Čínština krok za krokem

Interaktivní učebnice čínštiny pro české začátečníky. Má osm lekcí od pozdravů po koníčky a pokrývá zhruba úroveň HSK 1.

Aplikace je jeden HTML soubor, [`docs/index.html`](docs/index.html). Funguje v prohlížeči na počítači i na telefonu a nepotřebuje server.

## Co aplikace umí

- **Lekce v sedmi krocích**, stejně jako v učebnici: dialog, slovíčka, gramatika, znaky, výslovnost, mluvení a cvičení. U každé lekce je vidět, kolik kroků máš hotových.
- **Výslovnost**: každou čínskou větu si přehraješ klepnutím, přes hlas prohlížeče (Web Speech API).
- **Dialog jako scénka**: vybereš si roli, aplikace řekne repliky druhých a ty odpovídáš.
- **Cvičení s okamžitou kontrolou**: skládání vět z kartiček, doplňování, hledání radikálů a třídění znaků. Kontroluje se podle klíče z učebnice a uzná i jiná správná řešení, třeba 很高兴认识你 vedle 认识你很高兴.
- **Kartičky** se všemi 179 slovíčky a opakováním s rozestupy (Leitnerův systém): znak → význam, význam → znak, nebo poslech.
- **Trenažér tónů**: poslechneš si slovo a vybíráš pinyin se správnými tóny.
- **Pořadí tahů a psaní znaků** (knihovna Hanzi Writer): animace a kreslení prstem s kontrolou tahů.
- **Slovník** s hledáním česky, pinyinem (i bez tónů) a znaky.
- **Příručka**: přehled gramatiky, radikály, klíč ke cvičením.
- **Barevné tóny v pinyinu**: 1. červená, 2. oranžová, 3. zelená, 4. modrá, neutrální šedá. Dají se vypnout v nastavení.

Pokrok se ukládá v prohlížeči. Když aplikace běží jako artefakt na claude.ai, ukládá se navíc k účtu, takže je vidět i na dalších zařízeních.

## Jak to spustit

- **Lokálně**: otevři `docs/index.html` v prohlížeči.
- **Na webu**: https://vtfteam.github.io/chinacourse/ (GitHub Pages, zdroj *Deploy from a branch*, větev `main`, složka `/docs`). GitHub Pages zdarma fungují jen pro veřejné repozitáře.

Na výslovnost potřebuje zařízení čínský hlas:

- Chrome a Edge ho většinou mají.
- Na iPhonu ho přidáš v *Nastavení → Zpřístupnění → Předčítaný obsah → Hlasy*, na Macu podobně v nastavení Zpřístupnění.
- Na Androidu v nastavení převodu textu na řeč.

## Úpravy obsahu

Zdrojem textu je učebnice v Markdownu. Aplikace se z ní generuje:

| Soubor | Co obsahuje |
| --- | --- |
| `content/ucebnice.md` | Text učebnice: lekce, dialogy, slovíčka, gramatika, přílohy |
| `content/interaktivni.mjs` | Interaktivní cvičení, klíčová slova lekcí a pinyin ke kartičkám |
| `src/` | Vzhled a logika aplikace (HTML, CSS, JavaScript bez frameworku) |
| `tools/` | Převod Markdownu na data, sestavení a kontrola |

Po úpravě spusť:

```sh
npm install      # jen poprvé: stáhne data o tazích znaků
npm run check    # zkontroluje lekce a jestli jdou odpovědi složit z kartiček
npm run build    # vytvoří docs/index.html
```

Parser čeká, že lekce budou mít stejnou stavbu jako teď:

- nadpis `## Lekce N: Název`;
- pod ním oddíly `### Dialog: …`, `### Slovíčka`, `### Gramatika`, `### Znaky: …`, `### Výslovnost: …`, `### Mluvení: …` a `### Cvičení N`.

Nová lekce se v aplikaci objeví sama. Její interaktivní cvičení se doplní do `content/interaktivni.mjs`; dokud tam nejsou, zobrazí se cvičení jako text z učebnice.

## Licence a zdroje

- Data o tazích znaků, vložená do `docs/index.html`, pocházejí z balíčku [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data). Jsou odvozená z projektu Make Me a Hanzi a šíří se pod licencí Arphic Public License, jejíž text je v [`LICENSES/ARPHICPL.TXT`](LICENSES/ARPHICPL.TXT).
- Knihovna [Hanzi Writer](https://hanziwriter.org) je pod licencí MIT.
