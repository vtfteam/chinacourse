// Rozbor vět z dialogů: slova, doslovný překlad a jak je věta postavená.
// Klíč je přesný text repliky z ucebnice.md. Slova se zapisují jako
// "znaky|pinyin|význam" a pinyin kopíruje pinyin repliky (i bú, yí).
// `npm run check` ohlídá, že slova dají dohromady celou repliku.

export default {
  // ---------- Lekce 1 ----------
  '你好！': {
    w: ['你|Nǐ|ty', '好|hǎo|dobrý, dobře'],
    lit: 'Ty dobrý!',
    note: 'Nejběžnější pozdrav. Doslova přeješ druhému, ať je mu dobře. Dva 3. tóny za sebou: 你 se vysloví jako ní.',
  },
  '你好！你叫什么名字？': {
    w: ['你|Nǐ|ty', '好|hǎo|dobrý', '你|Nǐ|ty', '叫|jiào|jmenovat se', '什么|shénme|jaký, co', '名字|míngzi|jméno'],
    lit: 'Ty dobrý! Ty se jmenuješ jaké jméno?',
    note: 'Tázací slovo 什么 stojí tam, kde bude v odpovědi jméno: 你叫什么名字？ → 我叫 Petr。 Když je v otázce 什么, 吗 se už nepřidává (gramatika, bod 2).',
  },
  '我叫 Petr。你呢？': {
    w: ['我|Wǒ|já', '叫|jiào|jmenovat se', 'Petr|Petr|Petr (jméno)', '你|Nǐ|ty', '呢|ne|a co…?'],
    lit: 'Já se jmenuju Petr. A ty?',
    note: 'Odpověď kopíruje otázku, jen místo 什么名字 dosadíš jméno. 呢 za zájmenem vrací otázku zpátky (bod 4).',
  },
  '我叫王明。认识你很高兴。': {
    w: ['我|Wǒ|já', '叫|jiào|jmenovat se', '王明|Wáng Míng|Wang Ming (王 je příjmení)', '认识|Rènshi|poznat, znát', '你|nǐ|tě', '很|hěn|(velmi)', '高兴|gāoxìng|rád, potěšený'],
    lit: 'Poznat tě (je) velmi radostné.',
    note: 'Čínské jméno začíná příjmením: 王 Wáng je rodina, 明 Míng vlastní jméno. Celé 认识你 („poznat tě“) je podmět a 很高兴 ho popisuje bez slovesa „být“ (bod 3). Stejně dobře se říká 很高兴认识你。',
  },
  '我也很高兴。你好吗？': {
    w: ['我|Wǒ|já', '也|yě|také', '很|hěn|(velmi)', '高兴|gāoxìng|rád', '你|Nǐ|ty', '好|hǎo|dobře', '吗|ma|(otázka ano/ne)'],
    lit: 'Já také velmi rád. Ty dobře?',
    note: '也 stojí před 很, nikdy na začátku věty (bod 5). 你好吗？ vznikne z 你好 přidáním 吗 na konec, nic se nepřehazuje (bod 1). Na rozdíl od pozdravu 你好 je to opravdová otázka, jak se máš.',
  },
  '我很好，谢谢。你呢？': {
    w: ['我|Wǒ|já', '很|hěn|(velmi)', '好|hǎo|dobře', '谢谢|xièxie|děkuju', '你|Nǐ|ty', '呢|ne|a co…?'],
    lit: 'Já velmi dobře, díky. A ty?',
    note: '很 tu skoro neznamená „velmi“, jen spojuje 我 s přídavným jménem 好 (bod 3). Bez něj by 我好 znělo jako srovnání. 你呢 opět vrací otázku.',
  },
  '我也很好。': {
    w: ['我|Wǒ|já', '也|yě|také', '很|hěn|(velmi)', '好|hǎo|dobře'],
    lit: 'Já také velmi dobře.',
    note: 'Pořadí je vždy podmět – 也 – 很 – přídavné jméno. Dva 3. tóny 我也 zní jako wó yě.',
  },
  '再见！': {
    w: ['再|Zài|znovu', '见|jiàn|vidět (se)'],
    lit: 'Znovu se uvidíme.',
    note: 'Dva znaky, které se dají číst i samostatně: 再 znovu + 见 vidět. Stejný vzorec potkáš v lekci 4: 明天见 (uvidíme se zítra).',
  },

  // ---------- Lekce 2 ----------
  '你是哪国人？': {
    w: ['你|Nǐ|ty', '是|shì|být', '哪|nǎ|který', '国|guó|země, stát', '人|rén|člověk'],
    lit: 'Ty jsi které země člověk?',
    note: 'Tázací slovo 哪 stojí tam, kde bude odpověď: 我是捷克人。 是 je tu správně, protože následuje podstatné jméno 人 (bod 1).',
  },
  '我是捷克人。': {
    w: ['我|Wǒ|já', '是|shì|být', '捷克|Jiékè|Česko', '人|rén|člověk'],
    lit: 'Já jsem Česka člověk.',
    note: 'Země + 人 = obyvatel té země: 捷克人 Čech, 中国人 Číňan (bod 4). Slovosled je stejný jako v otázce, jen místo 哪国 je 捷克.',
  },
  '你是学生吗？': {
    w: ['你|Nǐ|ty', '是|shì|být', '学生|xuésheng|student', '吗|ma|(otázka ano/ne)'],
    lit: 'Ty jsi student?',
    note: 'Oznamovací věta 你是学生 + 吗 = otázka (lekce 1). 学生 je doslova „učící se žák“: 学 učit se + 生 žák.',
  },
  '是，我是学生。你也是学生吗？': {
    w: ['是|Shì|jsem (ano)', '我|wǒ|já', '是|shì|být', '学生|xuésheng|student', '你|Nǐ|ty', '也|yě|také', '是|shì|být', '学生|xuésheng|student', '吗|ma|(otázka)'],
    lit: 'Jsem, já jsem student. Ty také jsi student?',
    note: 'Čínština nemá univerzální „ano“, odpovídá se slovesem z otázky: 你是…吗？ → 是 (bod 3). 也 stojí před slovesem 是.',
  },
  '不是，我是老师。我教中文。': {
    w: ['不|Bú|ne', '是|shì|být', '我|wǒ|já', '是|shì|být', '老师|lǎoshī|učitel', '我|Wǒ|já', '教|jiāo|učit (někoho)', '中文|Zhōngwén|čínština'],
    lit: 'Nejsem, já jsem učitel. Já učím čínštinu.',
    note: 'Záporná odpověď = 不 + sloveso z otázky: 不是 (body 2 a 3). Před 4. tónem se 不 čte bú. 教 jiāo je učit někoho jiného, 学 xué učit se sám.',
  },
  '你会说英语吗？': {
    w: ['你|Nǐ|ty', '会|huì|umět', '说|shuō|mluvit', '英语|Yīngyǔ|angličtina', '吗|ma|(otázka)'],
    lit: 'Ty umíš mluvit angličtinu?',
    note: '会 + sloveso = umět něco naučeného (bod 5). Čeština řekne „umíš anglicky“, čínština potřebuje sloveso 说 a jazyk jako předmět.',
  },
  '会一点儿。你会说中文吗？': {
    w: ['会|Huì|umět', '一点儿|yìdiǎnr|trochu', '你|Nǐ|ty', '会|huì|umět', '说|shuō|mluvit', '中文|Zhōngwén|čínština', '吗|ma|(otázka)'],
    lit: 'Umím trochu. Ty umíš mluvit čínštinu?',
    note: 'Odpověď opět opakuje sloveso z otázky: 会 (umím). Podmět 我 se v odpovědi klidně vynechá, když je jasný.',
  },
  '我会说一点儿中文，可是中文很难。': {
    w: ['我|Wǒ|já', '会|huì|umět', '说|shuō|mluvit', '一点儿|yìdiǎnr|trochu', '中文|Zhōngwén|čínština', '可是|kěshì|ale', '中文|Zhōngwén|čínština', '很|hěn|(velmi)', '难|nán|těžký'],
    lit: 'Já umím mluvit trochu čínštinu, ale čínština velmi těžká.',
    note: '一点儿 stojí před podstatným jménem: 一点儿中文 = trochu čínštiny. Ve druhé půlce je přídavné jméno 难, takže bez 是, jen s 很 (bod 1).',
  },
  '中文不难！': {
    w: ['中文|Zhōngwén|čínština', '不|bù|ne', '难|nán|těžký'],
    lit: 'Čínština ne těžká!',
    note: 'V záporu přídavného jména 很 odpadá: 中文很难 → 中文不难 (bod 2). 难 má 2. tón, proto 不 zůstává bù.',
  },
  // ---------- Lekce 3 ----------
  '这是你的家人吗？': {
    w: ['这|Zhè|tohle', '是|shì|být', '你|nǐ|ty', '的|de|(přivlastnění)', '家人|jiārén|rodina, příbuzní', '吗|ma|(otázka)'],
    lit: 'Tohle je tvoje rodina?',
    note: '你的 = tvůj: zájmeno + 的 vytvoří přivlastňovací tvar (bod 4). 家人 = 家 domov + 人 lidé, tedy lidé z domova.',
  },
  '对。这是我爸爸，这是我妈妈。': {
    w: ['对|Duì|správně, ano', '这|Zhè|tohle', '是|shì|být', '我|wǒ|můj', '爸爸|bàba|táta', '这|zhè|tohle', '是|shì|být', '我|wǒ|moje', '妈妈|māma|máma'],
    lit: 'Správně. Tohle je můj táta, tohle je moje máma.',
    note: '对 je souhlas „přesně tak“. U blízkých lidí se 的 vynechává: 我爸爸, ne 我的爸爸 (bod 4).',
  },
  '你有哥哥吗？': {
    w: ['你|Nǐ|ty', '有|yǒu|mít', '哥哥|gēge|starší bratr', '吗|ma|(otázka)'],
    lit: 'Ty máš staršího bratra?',
    note: 'Čínština rozlišuje starší a mladší sourozence: 哥哥 starší bratr, 弟弟 mladší bratr. Obecné slovo „bratr“ se v běžné řeči skoro nepoužívá.',
  },
  '我没有哥哥，我有一个妹妹。': {
    w: ['我|Wǒ|já', '没有|méiyǒu|nemít', '哥哥|gēge|starší bratr', '我|wǒ|já', '有|yǒu|mít', '一|yí|jeden', '个|ge|(měrné slovo)', '妹妹|mèimei|mladší sestra'],
    lit: 'Já nemám staršího bratra, mám jeden kus mladší sestru.',
    note: 'Zápor slovesa 有 je vždy 没有 (bod 1). Mezi číslo a věc patří měrné slovo 个 (bod 2). 一 se před 个 čte yí.',
  },
  '你妹妹几岁？': {
    w: ['你|Nǐ|tvoje', '妹妹|mèimei|mladší sestra', '几|jǐ|kolik', '岁|suì|rok věku'],
    lit: 'Tvoje sestra kolik let?',
    note: 'Věk se říká bez slovesa (bod 5). 几 se ptá na malá čísla, proto se hodí na děti; dospělého se zeptáš 你多大？ 你妹妹 je bez 的, protože jde o blízkou osobu.',
  },
  '她八岁。你家有几个人？': {
    w: ['她|Tā|ona', '八|bā|osm', '岁|suì|rok věku', '你|Nǐ|tvoje', '家|jiā|rodina, domov', '有|yǒu|mít, je', '几|jǐ|kolik', '个|ge|(měrné slovo)', '人|rén|člověk'],
    lit: 'Ona osm let. Tvoje rodina má kolik lidí?',
    note: '几 stojí na místě odpovědi a jako každé číslo potřebuje měrné slovo: 几个人 (bod 2). 有 tu znamená „mít“ i „je, existuje“.',
  },
  '我家有四个人：爸爸、妈妈、姐姐和我。': {
    w: ['我|Wǒ|moje', '家|jiā|rodina', '有|yǒu|mít', '四|sì|čtyři', '个|ge|(měrné slovo)', '人|rén|člověk', '爸爸|bàba|táta', '妈妈|māma|máma', '姐姐|jiějie|starší sestra', '和|hé|a', '我|wǒ|já'],
    lit: 'Moje rodina má čtyři lidi: táta, máma, starší sestra a já.',
    note: 'Odpověď kopíruje otázku a místo 几 dosadí číslo 四. 和 spojuje jen podstatná jména a zájmena, ne celé věty. Čárka 、 odděluje položky výčtu.',
  },
  '你姐姐有孩子吗？': {
    w: ['你|Nǐ|tvoje', '姐姐|jiějie|starší sestra', '有|yǒu|mít', '孩子|háizi|dítě, děti', '吗|ma|(otázka)'],
    lit: 'Tvoje starší sestra má děti?',
    note: 'Čínská podstatná jména nemají množné číslo: 孩子 je dítě i děti, rozhodne kontext nebo číslovka.',
  },
  '有，她有两个孩子。': {
    w: ['有|Yǒu|má (ano)', '她|tā|ona', '有|yǒu|mít', '两|liǎng|dva', '个|ge|(měrné slovo)', '孩子|háizi|děti'],
    lit: 'Má, ona má dva kusy dětí.',
    note: '„Ano“ se řekne zopakovaným slovesem 有. Při počítání věcí se říká 两, ne 二 (bod 3).',
  },

  // ---------- Lekce 4 ----------
  '现在几点？': {
    w: ['现在|Xiànzài|teď', '几|jǐ|kolik', '点|diǎn|hodina (na hodinách)'],
    lit: 'Teď kolik hodin?',
    note: 'Bez slovesa, stejně jako u věku. 几 stojí na místě, kde bude v odpovědi číslo.',
  },
  '现在三点半。': {
    w: ['现在|Xiànzài|teď', '三|sān|tři', '点|diǎn|hodina', '半|bàn|půl'],
    lit: 'Teď tři hodiny a půl.',
    note: 'Pozor: 三点半 je 15:30, česky „půl čtvrté“. Čínština počítá od celé hodiny dopředu: hodina + 半 (bod 3).',
  },
  '今天星期几？': {
    w: ['今天|Jīntiān|dnes', '星期|xīngqī|týden', '几|jǐ|kolik (kolikátý)'],
    lit: 'Dnes týden kolikátý?',
    note: 'Dny v týdnu jsou očíslované, takže se ptáš na číslo dne: 星期 + 几. Odpověď dosadí číslo: 星期四.',
  },
  '今天星期四，十月十五号。': {
    w: ['今天|Jīntiān|dnes', '星期四|xīngqī sì|čtvrtek (4. den týdne)', '十月|shí yuè|říjen (10. měsíc)', '十五号|shíwǔ hào|patnáctého (15. den)'],
    lit: 'Dnes týden-čtyři, desátý měsíc, patnáctý den.',
    note: 'Datum jde od největšího k nejmenšímu: měsíc → den (bod 2). Měsíce se jen číslují: 十月 je „desátý měsíc“. 号 značí den v měsíci.',
  },
  '你明天有空吗？': {
    w: ['你|Nǐ|ty', '明天|míngtiān|zítra', '有空|yǒu kòng|mít čas (volno)', '吗|ma|(otázka)'],
    lit: 'Ty zítra máš volno?',
    note: 'Kdo – Kdy – Co: čas 明天 stojí mezi podmětem a slovesem, nikdy na konci (bod 1). 有空 je doslova „mít prázdno“.',
  },
  '明天上午我上课，下午有空。': {
    w: ['明天|Míngtiān|zítra', '上午|shàngwǔ|dopoledne', '我|wǒ|já', '上课|shàngkè|mít výuku', '下午|xiàwǔ|odpoledne', '有空|yǒu kòng|mít čas'],
    lit: 'Zítra dopoledne já mám výuku, odpoledne mám volno.',
    note: 'Tady čas stojí na začátku věty, před podmětem. I to je správně, jen nesmí být na konci. Čas jde od většího k menšímu: 明天 → 上午.',
  },
  '我们明天下午两点一起喝咖啡吧！': {
    w: ['我们|Wǒmen|my', '明天|míngtiān|zítra', '下午|xiàwǔ|odpoledne', '两|liǎng|dvě', '点|diǎn|hodina', '一起|yìqǐ|spolu', '喝|hē|pít', '咖啡|kāfēi|káva', '吧|ba|(návrh: pojďme)'],
    lit: 'My zítra odpoledne dvě hodiny spolu pít kávu, pojďme!',
    note: 'Celá šablona: Kdo (我们) – Kdy (明天下午两点) – Jak (一起) – Co (喝咖啡). 吧 na konci dělá z oznámení návrh (bod 4). Dvě hodiny jsou 两点, ne 二点.',
  },
  '好啊！明天见！': {
    w: ['好|Hǎo|dobře', '啊|a|(nadšení)', '明天|Míngtiān|zítra', '见|jiàn|vidět se'],
    lit: 'Dobře! Zítra se vidíme!',
    note: '啊 na konci dodá nadšení, něco jako „jasně!“. 明天见 je stejný vzorec jako 再见: kdy + 见. Stejně se řekne 下午见 (uvidíme se odpoledne).',
  },
  // ---------- Lekce 5 ----------
  '你好！几位？': {
    w: ['你|Nǐ|ty', '好|hǎo|dobrý', '几|Jǐ|kolik', '位|wèi|(osoba, zdvořile)'],
    lit: 'Dobrý den! Kolik osob?',
    note: 'Zkrácená otázka 几位 je běžná u vstupu do restaurace. 位 je zdvořilé měrné slovo pro lidi, zdvořilejší než 个 (bod 2).',
  },
  '两位。': {
    w: ['两|Liǎng|dva', '位|wèi|(osoby)'],
    lit: 'Dvě osoby.',
    note: 'Odpověď stačí bez slovesa: číslo + měrné slovo. Před měrným slovem se říká 两, ne 二.',
  },
  '这是菜单。你们想吃什么？': {
    w: ['这|Zhè|tohle', '是|shì|být', '菜单|càidān|jídelní lístek', '你们|Nǐmen|vy', '想|xiǎng|chtít, mít chuť', '吃|chī|jíst', '什么|shénme|co'],
    lit: 'Tohle je jídelní lístek. Vy máte chuť jíst co?',
    note: '你们 = 你 + přípona množného čísla 们. 想 + sloveso = mám chuť, rád bych (bod 1). 什么 stojí na místě odpovědi, za slovesem.',
  },
  '我要一碗牛肉面，还要二十个饺子。': {
    w: ['我|Wǒ|já', '要|yào|chtít, dát si', '一|yì|jedna', '碗|wǎn|miska', '牛肉|niúròu|hovězí', '面|miàn|nudle', '还|hái|ještě', '要|yào|dát si', '二十|èrshí|dvacet', '个|ge|(kus)', '饺子|jiǎozi|knedlíčky'],
    lit: 'Já chci jednu misku hovězích nudlí, ještě chci dvacet kusů knedlíčků.',
    note: 'Při objednávce se říká 要 (bod 1). Číslo + měrné slovo + věc: 一碗 = miska, 二十个 = dvacet kusů (bod 2). 还 stojí před slovesem (bod 5). V čísle 二十 zůstává 二.',
  },
  '我要一个麻婆豆腐和一碗米饭。': {
    w: ['我|Wǒ|já', '要|yào|dát si', '一|yí|jedno', '个|ge|(kus)', '麻婆豆腐|mápó dòufu|mapo tofu (pálivé tofu)', '和|hé|a', '一|yì|jedna', '碗|wǎn|miska', '米饭|mǐfàn|vařená rýže'],
    lit: 'Já si dám jedno mapo tofu a jednu misku rýže.',
    note: '和 spojuje dvě podstatná jména. 一 se čte yí před 个 (ten má 4. tón) a yì před 碗 (3. tón), viz výslovnost v lekci 3.',
  },
  '你们喝什么？茶还是啤酒？': {
    w: ['你们|Nǐmen|vy', '喝|hē|pít', '什么|shénme|co', '茶|Chá|čaj', '还是|háishì|nebo', '啤酒|píjiǔ|pivo'],
    lit: 'Vy pijete co? Čaj, nebo pivo?',
    note: 'A 还是 B je otázka s výběrem, proto na konci není 吗 (bod 3). V 啤酒 zachycuje 啤 zvuk slova „beer“ a 酒 znamená alkohol.',
  },
  '我要一杯茶。': {
    w: ['我|Wǒ|já', '要|yào|dát si', '一|yì|jeden', '杯|bēi|šálek', '茶|chá|čaj'],
    lit: 'Já si dám jeden šálek čaje.',
    note: 'Čaj je tekutina, tak se počítá nádobou: 一杯茶 (šálek čaje), 一杯水 (sklenice vody).',
  },
  '我也是。': {
    w: ['我|Wǒ|já', '也|yě|také', '是|shì|být'],
    lit: 'Já také jsem.',
    note: 'Ustálená odpověď „já taky“, platí pro cokoli předtím řečeného. 也 stojí před slovesem 是.',
  },
  '还要别的吗？': {
    w: ['还|Hái|ještě', '要|yào|chtít', '别的|biéde|něco jiného', '吗|ma|(otázka)'],
    lit: 'Ještě chcete něco jiného?',
    note: 'Podmět 你们 je vynechaný, protože je jasný. 别的 = 别 jiný + 的, tedy „to jiné“.',
  },
  '不要了，谢谢。': {
    w: ['不|Bú|ne', '要|yào|chtít', '了|le|(už)', '谢谢|xièxie|děkuju'],
    lit: 'Už nechci, díky.',
    note: 'Samotné 不要 zní jako odmítnutí až rozkaz. 了 na konci říká, že se situace změnila, tedy „už ne“, a zní zdvořile (bod 1). 不 se před 4. tónem čte bú.',
  },
  '这个饭馆的菜太好吃了！': {
    w: ['这个|Zhège|tento', '饭馆|fànguǎn|restaurace', '的|de|(přivlastnění)', '菜|cài|jídlo', '太|tài|hrozně, příliš', '好吃|hǎochī|chutný', '了|le|(citové zesílení)'],
    lit: 'Této restaurace jídlo hrozně chutné!',
    note: '这个饭馆的菜 = jídlo této restaurace: vlastník stojí první a spojí ho 的. 太…了 vyjadřuje nadšení, 了 tu neznačí minulost (bod 4). 好吃 je doslova „dobré k jídlu“.',
  },
  '对，可是有一点儿辣。': {
    w: ['对|Duì|správně', '可是|kěshì|ale', '有一点儿|yǒu yìdiǎnr|trochu (moc)', '辣|là|pálivý'],
    lit: 'Správně, ale je trochu pálivé.',
    note: '有一点儿 + přídavné jméno vyjadřuje mírnou výtku: je to trochu víc, než bych chtěl. Podrobně to probírá lekce 6.',
  },
  '服务员，买单！': {
    w: ['服务员|Fúwùyuán|číšník, obsluha', '买单|mǎidān|zaplatit účet'],
    lit: 'Obsluho, účet!',
    note: '服务员 = 服务 služba + 员 pracovník. Tak se oslovuje obsluha v restauraci i v obchodě. 买单 je doslova „koupit lístek“, tedy zaplatit účet.',
  },

  // ---------- Lekce 6 ----------
  '老板，这件衣服多少钱？': {
    w: ['老板|Lǎobǎn|šéf (oslovení prodavače)', '这|zhè|tento', '件|jiàn|(kus oblečení)', '衣服|yīfu|oblečení', '多少|duōshao|kolik', '钱|qián|peníze'],
    lit: 'Šéfe, tento kus oblečení kolik peněz?',
    note: 'Ukazovací 这 potřebuje měrné slovo stejně jako číslo: 这件衣服 (bod 2). Cena se říká bez slovesa: věc + 多少钱 (bod 1).',
  },
  '两百块。': {
    w: ['两|Liǎng|dvě', '百|bǎi|sto', '块|kuài|jüan (hovorově)'],
    lit: 'Dvě stě jüanů.',
    note: '块 je hovorový název měny, v psaném textu 元. Dvě stě je 两百, běžnější než 二百.',
  },
  '太贵了！便宜一点儿吧。': {
    w: ['太|Tài|příliš', '贵|guì|drahý', '了|le|(citové zesílení)', '便宜|Piányi|levný', '一点儿|yìdiǎnr|trochu (víc)', '吧|ba|(prosba, návrh)'],
    lit: 'Příliš drahé! Levnější trochu, ne?',
    note: '太…了 = moc (lekce 5). Přídavné jméno + 一点儿 = trochu víc, tedy přání „trochu levněji“ (bod 4). 吧 prosbu změkčí.',
  },
  '一百五，好吗？': {
    w: ['一百|Yìbǎi|sto', '五|wǔ|pět (desítek)', '好|hǎo|dobře', '吗|ma|(otázka)'],
    lit: 'Sto pět(desát), dobře?',
    note: '一百五 je hovorová zkratka pro 一百五十 = 150: poslední řád se vynechá (bod 1). 好吗？ za návrhem znamená „platí?“.',
  },
  '一百二吧。': {
    w: ['一百|Yìbǎi|sto', '二|èr|dva (desítky)', '吧|ba|(protinávrh)'],
    lit: 'Sto dva(cet), co říkáte?',
    note: 'Stejná zkratka: 一百二 = 120. Tady je 二, protože jde o číslici v čísle, ne o počet kusů. 吧 z ceny dělá protinávrh.',
  },
  '好吧。你要什么颜色？红的还是黑的？': {
    w: ['好|Hǎo|dobře', '吧|ba|(tak tedy)', '你|Nǐ|ty', '要|yào|chtít', '什么|shénme|jaký', '颜色|yánsè|barva', '红|Hóng|červený', '的|de|(ten …)', '还是|háishì|nebo', '黑|hēi|černý', '的|de|(ten …)'],
    lit: 'Dobře tedy. Ty chceš jakou barvu? Červenou, nebo černou?',
    note: '好吧 zní jako neochotné „no tak dobře“. 红的 = „ta červená“: přídavné jméno + 的 zastoupí podstatné jméno (bod 3). A 还是 B je výběr (lekce 5).',
  },
  '我要黑的。我可以试试吗？': {
    w: ['我|Wǒ|já', '要|yào|chtít', '黑|hēi|černý', '的|de|(ten …)', '我|Wǒ|já', '可以|kěyǐ|smět, moci', '试试|shìshi|vyzkoušet si', '吗|ma|(otázka)'],
    lit: 'Já chci tu černou. Já smím zkusit-zkusit?',
    note: 'Zdvojené sloveso 试试 zní uvolněně, „na chvilku si vyzkoušet“ (bod 6). 可以 se ptá na dovolení.',
  },
  '可以。': {
    w: ['可以|Kěyǐ|smíš, jde to'],
    lit: 'Smíš.',
    note: 'Odpověď ano = zopakované sloveso z otázky. Zápor by byl 不可以.',
  },
  '这件有一点儿小。有没有大一点儿的？': {
    w: ['这|Zhè|tento', '件|jiàn|(kus oblečení)', '有一点儿|yǒu yìdiǎnr|trochu (moc)', '小|xiǎo|malý', '有|Yǒu|mít', '没|mei|ne', '有|yǒu|mít', '大|dà|velký', '一点儿|yìdiǎnr|trochu (víc)', '的|de|(ten …)'],
    lit: 'Tento kus je trochu malý. Máte-nemáte trochu větší?',
    note: 'Hlavní rozdíl lekce v jedné replice: 有一点儿小 je stížnost (trochu malé), 大一点儿 je srovnání (trochu větší) (bod 4). 有没有 je otázka bez 吗 (bod 5). Slovo 衣服 se vynechá, je jasné, o co jde.',
  },
  '有，这件。': {
    w: ['有|Yǒu|mám', '这|zhè|tento', '件|jiàn|(kus)'],
    lit: 'Mám, tento kus.',
    note: 'Opět odpověď slovesem z otázky. 这件 stačí samo, podstatné jméno se vynechá (bod 2).',
  },
  '好，我买。可以用微信付钱吗？': {
    w: ['好|Hǎo|dobře', '我|wǒ|já', '买|mǎi|koupit', '可以|Kěyǐ|smět, moci', '用|yòng|použít', '微信|Wēixìn|WeChat', '付钱|fù qián|zaplatit', '吗|ma|(otázka)'],
    lit: 'Dobře, já kupuju. Smím použít WeChat zaplatit?',
    note: '用 + nástroj + sloveso = udělat něco pomocí něčeho: 用微信付钱 (zaplatit přes WeChat). Pozor na 买 mǎi koupit × 卖 mài prodat.',
  },
  '可以，扫这里。': {
    w: ['可以|Kěyǐ|jde to', '扫|sǎo|naskenovat', '这里|zhèlǐ|tady'],
    lit: 'Jde to, naskenujte tady.',
    note: '这里 je jižní a psaná podoba slova 这儿 (lekce 7). V Číně se dnes skoro všude platí naskenováním QR kódu mobilem.',
  },
  // ---------- Lekce 7 ----------
  '请问，地铁站在哪儿？': {
    w: ['请问|Qǐngwèn|promiňte, že se ptám', '地铁站|dìtiězhàn|stanice metra', '在|zài|být (někde)', '哪儿|nǎr|kde'],
    lit: 'Prosím-ptám se, stanice metra je kde?',
    note: '请问 = 请 prosím + 问 ptát se: zdvořilý úvod otázky na cestu. Věc + 在 + 哪儿 je otázka, KDE něco je (bod 1).',
  },
  '地铁站在银行旁边。': {
    w: ['地铁站|Dìtiězhàn|stanice metra', '在|zài|být (někde)', '银行|yínháng|banka', '旁边|pángbiān|vedle'],
    lit: 'Stanice metra je banky vedle.',
    note: 'Odpověď nahradí 哪儿 místem. Místní slovo stojí ZA podstatným jménem: 银行旁边 = vedle banky (bod 2).',
  },
  '离这儿远吗？': {
    w: ['离|Lí|od (vzdálenost)', '这儿|zhèr|tady', '远|yuǎn|daleko', '吗|ma|(otázka)'],
    lit: 'Od tady daleko?',
    note: 'Celá věta by byla 地铁站离这儿远吗？ Podmět je jasný, tak se vynechá. A 离 B 远 = A je daleko od B (bod 4).',
  },
  '不远，走路五分钟。': {
    w: ['不|Bù|ne', '远|yuǎn|daleko', '走路|zǒulù|pěšky, chůze', '五|wǔ|pět', '分钟|fēnzhōng|minuta (délka)'],
    lit: 'Ne daleko, pěšky pět minut.',
    note: 'Zápor přídavného jména je bez 很 (lekce 2). 分钟 je délka trvání (pět minut), kdežto 分 z lekce 4 je minuta na hodinách.',
  },
  '怎么走？': {
    w: ['怎么|Zěnme|jak', '走|zǒu|jít'],
    lit: 'Jak jít?',
    note: '怎么 + sloveso = jak se to dělá (bod 5). Celá věta by byla 去地铁站怎么走？',
  },
  '你一直往前走，到红绿灯往左拐。银行就在左边。': {
    w: ['你|Nǐ|ty', '一直|yìzhí|pořád, rovně', '往|wǎng|směrem k', '前|qián|dopředu', '走|zǒu|jít', '到|dào|dojít k', '红绿灯|hónglǜdēng|semafor', '往|wǎng|směrem k', '左|zuǒ|vlevo', '拐|guǎi|zabočit', '银行|Yínháng|banka', '就|jiù|hned, právě', '在|zài|být (někde)', '左边|zuǒbian|vlevo'],
    lit: 'Ty pořád směrem dopředu jdi, dojdi k semaforu, směrem vlevo zaboč. Banka hned je vlevo.',
    note: '往 + směr stojí před slovesem: 往前走 jdi dopředu, 往左拐 zaboč doleva. 就 zdůrazňuje „hned, přímo tam“. 红绿灯 je doslova „červeno-zelené světlo“.',
  },
  '附近有超市吗？': {
    w: ['附近|Fùjìn|poblíž', '有|yǒu|je, existuje', '超市|chāoshì|supermarket', '吗|ma|(otázka)'],
    lit: 'Poblíž je supermarket?',
    note: 'Místo + 有 + věc se ptá, JESTLI tam něco je (bod 1). Porovnej s 地铁站在哪儿？, kde víš, že stanice existuje, a ptáš se kde.',
  },
  '有，超市在地铁站对面。': {
    w: ['有|Yǒu|je', '超市|chāoshì|supermarket', '在|zài|být (někde)', '地铁站|dìtiězhàn|stanice metra', '对面|duìmiàn|naproti'],
    lit: 'Je, supermarket je stanice metra naproti.',
    note: 'Nejdřív odpověď na otázku s 有 (je), pak upřesnění s 在 (kde). Místní slovo 对面 opět stojí za podstatným jménem.',
  },
  '太好了，谢谢！': {
    w: ['太|Tài|příliš', '好|hǎo|dobrý', '了|le|(citové zesílení)', '谢谢|xièxie|děkuju'],
    lit: 'Příliš dobré, díky!',
    note: '太好了 je ustálené „super, skvělé“. Vzorec 太 + přídavné jméno + 了 znáš z lekce 5.',
  },
  '不客气。': {
    w: ['不|Bú|ne', '客气|kèqi|zdvořilý, ostýchavý'],
    lit: 'Nebuď zdvořilý.',
    note: 'Ustálená odpověď na 谢谢, česky „není zač“. Doslova „nemusíš se ostýchat“. 不 se před 4. tónem čte bú.',
  },

  // ---------- Lekce 8 ----------
  '你周末常常做什么？': {
    w: ['你|Nǐ|ty', '周末|zhōumò|víkend', '常常|chángcháng|často', '做|zuò|dělat', '什么|shénme|co'],
    lit: 'Ty o víkendu často děláš co?',
    note: 'Kdo – Kdy – Jak často – Co dělá: čas 周末 i příslovce 常常 stojí před slovesem (bod 2). 什么 je na místě odpovědi.',
  },
  '我喜欢运动。我常常跑步，有时候踢足球。你呢？': {
    w: ['我|Wǒ|já', '喜欢|xǐhuan|mít rád', '运动|yùndòng|sport', '我|Wǒ|já', '常常|chángcháng|často', '跑步|pǎobù|běhat', '有时候|yǒu shíhou|někdy', '踢|tī|kopat', '足球|zúqiú|fotbal', '你|Nǐ|ty', '呢|ne|a co…?'],
    lit: 'Já mám rád sport. Já často běhám, někdy kopu fotbal. A ty?',
    note: '喜欢 + sloveso nebo věc = mít rád (bod 1). Fotbal se kope: 踢足球, kde 足球 = 足 noha + 球 míč. 有时候 je doslova „mít chvíle“, tedy někdy.',
  },
  '我不太喜欢运动。我喜欢看书和看电影。': {
    w: ['我|Wǒ|já', '不太|bú tài|ne moc', '喜欢|xǐhuan|mít rád', '运动|yùndòng|sport', '我|Wǒ|já', '喜欢|xǐhuan|mít rád', '看|kàn|dívat se, číst', '书|shū|kniha', '和|hé|a', '看|kàn|dívat se', '电影|diànyǐng|film'],
    lit: 'Já ne moc mám rád sport. Já mám rád dívat se do knih a dívat se na filmy.',
    note: '不太 zmírní zápor: „moc nemusím“ (bod 1). 看 znamená dívat se, takže 看书 je „dívat se do knihy“, tedy číst. 电影 je doslova „elektrický stín“.',
  },
  '上个周末你做什么了？': {
    w: ['上个|Shàng ge|minulý', '周末|zhōumò|víkend', '你|nǐ|ty', '做|zuò|dělat', '什么|shénme|co', '了|le|(stalo se)'],
    lit: 'Minulý víkend ty dělal co?',
    note: 'Sloveso se nemění, minulost pozná posluchač z časového slova 上个周末 a z 了 na konci (bod 3). 上 je doslova „nahoře“: minulý je ten „nad“ dneškem, příští 下个 ten „pod“ ním.',
  },
  '我跟朋友去看了一个中国电影。': {
    w: ['我|Wǒ|já', '跟|gēn|s (někým)', '朋友|péngyou|kamarád', '去|qù|jít', '看|kàn|dívat se', '了|le|(stalo se)', '一|yí|jeden', '个|ge|(měrné slovo)', '中国|Zhōngguó|čínský (Čína)', '电影|diànyǐng|film'],
    lit: 'Já s kamarádem šel dívat se jeden čínský film.',
    note: 'S kým (跟朋友) stojí před slovesem (bod 5). 了 je hned za slovesem 看, protože následuje počet: 看了一个电影 (bod 3). 中国电影 = čínský film, země funguje jako přídavné jméno.',
  },
  '你觉得怎么样？': {
    w: ['你|Nǐ|ty', '觉得|juéde|myslet si, připadat', '怎么样|zěnmeyàng|jak, jaký'],
    lit: 'Ty si myslíš jak?',
    note: '觉得 + 怎么样 je běžná otázka na názor, česky „jak se ti líbil?“. Předmět (film) se vynechá, je jasný.',
  },
  '很有意思！这个周末你打算做什么？': {
    w: ['很|Hěn|velmi', '有意思|yǒu yìsi|zajímavý', '这个|Zhège|tento', '周末|zhōumò|víkend', '你|nǐ|ty', '打算|dǎsuàn|plánovat', '做|zuò|dělat', '什么|shénme|co'],
    lit: 'Velmi zajímavý! Tento víkend ty plánuješ dělat co?',
    note: '有意思 je doslova „mít smysl“, tedy zajímavý. Budoucnost se vyjádří slovem plánu 打算 + sloveso (bod 4) a časem 这个周末.',
  },
  '我打算在家做饺子。你想跟我一起做吗？': {
    w: ['我|Wǒ|já', '打算|dǎsuàn|plánovat', '在|zài|v, na (místo)', '家|jiā|doma', '做|zuò|dělat', '饺子|jiǎozi|knedlíčky', '你|Nǐ|ty', '想|xiǎng|chtít', '跟|gēn|s', '我|wǒ|mnou', '一起|yìqǐ|spolu', '做|zuò|dělat', '吗|ma|(otázka)'],
    lit: 'Já plánuju doma dělat knedlíčky. Ty chceš se mnou spolu dělat?',
    note: 'Místo 在家 stojí před slovesem (lekce 7). 跟我一起 = spolu se mnou, také před slovesem (bod 5). Plná šablona: Kdo – S kým – Kde – Co.',
  },
  '好啊！你为什么想做饺子？': {
    w: ['好|Hǎo|dobře', '啊|a|(nadšení)', '你|Nǐ|ty', '为什么|wèishénme|proč', '想|xiǎng|chtít', '做|zuò|dělat', '饺子|jiǎozi|knedlíčky'],
    lit: 'Dobře! Ty proč chceš dělat knedlíčky?',
    note: '为什么 = 为 kvůli + 什么 co, tedy „kvůli čemu“. Stojí za podmětem před slovesem, ne na začátku jako české „proč“.',
  },
  '因为我很喜欢吃饺子，所以想学！': {
    w: ['因为|Yīnwèi|protože', '我|wǒ|já', '很|hěn|velmi', '喜欢|xǐhuan|mít rád', '吃|chī|jíst', '饺子|jiǎozi|knedlíčky', '所以|suǒyǐ|proto, tak', '想|xiǎng|chtít', '学|xué|učit se'],
    lit: 'Protože já velmi rád jím knedlíčky, tak se chci učit!',
    note: 'Čínština ráda použije obě spojky 因为…所以… najednou (bod 6). Před 喜欢 tu 很 opravdu znamená „velmi“.',
  },
};
