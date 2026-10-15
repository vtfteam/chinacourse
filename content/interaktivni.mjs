// Interaktivní část učebnice: klíčová slova lekcí a cvičení s kontrolou.
// Text lekcí se bere z ucebnice.md, tady jsou jen věci, které aplikace
// potřebuje navíc. Po úpravě spusť `npm run build` a `npm run check`.
//
// Typy cvičení:
//   build  – skládání věty z kartiček. `tiles` jsou správné díly, `extra`
//            záludné navíc. `keypad` (u sady) = klávesnice, kartičky jdou
//            použít opakovaně. Odpovědi: "znaky | pinyin", první je hlavní.
//   choice – doplňování. `options` u sady, `answer` u položky.
//   pick   – vyber znaky s daným radikálem.
//   sort   – roztřiď znaky do skupin.
//   write  – volné psaní, bez kontroly.

export const lessons = {
  1: { key: '你好', keyPy: 'nǐ hǎo' },
  2: { key: '中文', keyPy: 'Zhōngwén' },
  3: { key: '我家', keyPy: 'wǒ jiā' },
  4: { key: '几点', keyPy: 'jǐ diǎn' },
  5: { key: '好吃', keyPy: 'hǎochī' },
  6: { key: '多少钱', keyPy: 'duōshao qián' },
  7: { key: '在哪儿', keyPy: 'zài nǎr' },
  8: { key: '喜欢', keyPy: 'xǐhuan' },
};

// Pinyin pro kartičky, které nejsou ve slovníčku lekcí.
export const extraPinyin = {
  一: 'yī', 二: 'èr', 三: 'sān', 四: 'sì', 五: 'wǔ', 六: 'liù', 七: 'qī', 八: 'bā', 九: 'jiǔ', 十: 'shí',
  王明: 'Wáng Míng', 我们: 'wǒmen', 没: 'méi', 太: 'tài', 了: 'le', 试试: 'shìshi', 日: 'rì', 天: 'tiān',
  星期一: 'xīngqīyī', 星期三: 'xīngqīsān', 星期四: 'xīngqīsì', 星期六: 'xīngqīliù', 星期天: 'xīngqītiān',
  喝咖啡: 'hē kāfēi', 明天上午: 'míngtiān shàngwǔ', 今天晚上: 'jīntiān wǎnshang',
  明天晚上: 'míngtiān wǎnshang', 跟朋友一起: 'gēn péngyou yìqǐ',
};

const NUMBERS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

export const exercises = {
  1: [
    {
      id: 'A', type: 'build', title: 'Udělej z věty otázku s 吗.',
      items: [
        { prompt: '你很好。', tiles: ['你', '很', '好', '吗'], extra: ['呢', '什么'], answers: ['你很好吗？ | Nǐ hěn hǎo ma?'] },
        { prompt: '他叫王明。', tiles: ['他', '叫', '王明', '吗'], extra: ['呢', '什么'], answers: ['他叫王明吗？ | Tā jiào Wáng Míng ma?'] },
        { prompt: '她也很高兴。', tiles: ['她', '也', '很', '高兴', '吗'], extra: ['呢'], answers: ['她也很高兴吗？ | Tā yě hěn gāoxìng ma?'] },
      ],
    },
    {
      id: 'B', type: 'build', title: 'Přelož do čínštiny.',
      items: [
        { prompt: 'Já se mám taky dobře.', tiles: ['我', '也', '很', '好'], extra: ['你', '吗', '是'], answers: ['我也很好。 | Wǒ yě hěn hǎo.'], note: '也 stojí před 很, nikdy na začátku věty.' },
        { prompt: 'Jak se jmenuješ?', tiles: ['你', '叫', '什么', '名字'], extra: ['吗', '我', '呢'], answers: ['你叫什么名字？ | Nǐ jiào shénme míngzi?'], note: 'Když je v otázce 什么, 吗 už nepatří.' },
        { prompt: 'Rád tě poznávám.', tiles: ['认识', '你', '很', '高兴'], extra: ['我', '也', '吗'], answers: ['认识你很高兴。 | Rènshi nǐ hěn gāoxìng.', '很高兴认识你。 | Hěn gāoxìng rènshi nǐ.'] },
      ],
    },
    {
      id: 'C', type: 'pick', title: 'Ve kterých znacích najdeš radikál 口 (ústa)?',
      chars: ['你', '吗', '好', '呢', '叫', '他'], answer: ['吗', '呢', '叫'],
      note: '你 a 他 mají vlevo 亻 (člověk), 好 má 女 (žena).',
    },
  ],
  2: [
    {
      id: 'A', type: 'build', title: 'Udělej z věty zápor.',
      items: [
        { prompt: '我是老师。', tiles: ['我', '不', '是', '老师'], extra: ['没', '很'], answers: ['我不是老师。 | Wǒ bú shì lǎoshī.'] },
        { prompt: '中文很难。', tiles: ['中文', '不', '难'], extra: ['很', '是'], answers: ['中文不难。 | Zhōngwén bù nán.'], note: 'V záporu přídavného jména 很 odpadá.' },
        { prompt: '他会说英语。', tiles: ['他', '不', '会', '说', '英语'], extra: ['没', '是'], answers: ['他不会说英语。 | Tā bú huì shuō Yīngyǔ.'] },
      ],
    },
    {
      id: 'B', type: 'choice', title: 'Doplň 是, nebo 很.', options: ['是', '很'],
      items: [
        { prompt: '我___捷克人。', answer: '是', full: '我是捷克人。 | Wǒ shì Jiékè rén.', note: '捷克人 je podstatné jméno, proto 是.' },
        { prompt: '她___高兴。', answer: '很', full: '她很高兴。 | Tā hěn gāoxìng.', note: '高兴 je přídavné jméno, proto 很.' },
        { prompt: '王明___老师。', answer: '是', full: '王明是老师。 | Wáng Míng shì lǎoshī.', note: '老师 je podstatné jméno, proto 是.' },
      ],
    },
    {
      id: 'C', type: 'pick', title: 'Ve kterých znacích najdeš radikál 讠 (řeč)?',
      chars: ['说', '你', '语', '好', '谢', '国'], answer: ['说', '语', '谢'],
      note: '你 má 亻 (člověk), 好 má 女 (žena) a 国 má ohradu 囗.',
    },
  ],
  3: [
    {
      id: 'A', type: 'build', title: 'Napiš čínskými znaky.', keypad: NUMBERS,
      items: [
        { prompt: '7', answers: ['七 | qī'] },
        { prompt: '15', answers: ['十五 | shíwǔ'] },
        { prompt: '32', answers: ['三十二 | sānshí\'èr'] },
        { prompt: '99', answers: ['九十九 | jiǔshíjiǔ'] },
      ],
    },
    {
      id: 'B', type: 'build', title: 'Přelož do čínštiny.',
      items: [
        { prompt: 'Nemám staršího bratra.', tiles: ['我', '没', '有', '哥哥'], extra: ['不', '弟弟'], answers: ['我没有哥哥。 | Wǒ méiyǒu gēge.'], note: 'Zápor slovesa 有 je vždy 没有.' },
        { prompt: 'Mám dvě starší sestry.', tiles: ['我', '有', '两', '个', '姐姐'], extra: ['二', '妹妹'], answers: ['我有两个姐姐。 | Wǒ yǒu liǎng ge jiějie.'] },
        { prompt: 'Kolik lidí je u vás doma?', tiles: ['你', '家', '有', '几', '个', '人'], extra: ['吗', '的'], answers: ['你家有几个人？ | Nǐ jiā yǒu jǐ ge rén?'] },
      ],
    },
    {
      id: 'C', type: 'build', title: 'Najdi chybu a oprav ji.', fix: true,
      items: [
        { prompt: '我不有弟弟。', tiles: ['我', '没', '有', '弟弟'], extra: ['不'], answers: ['我没有弟弟。 | Wǒ méiyǒu dìdi.'], note: 'Zápor slovesa 有 je vždy 没有, nikdy 不有.' },
        { prompt: '她有二个孩子。', tiles: ['她', '有', '两', '个', '孩子'], extra: ['二'], answers: ['她有两个孩子。 | Tā yǒu liǎng ge háizi.'], note: 'Před měrným slovem se říká 两, ne 二.' },
        { prompt: '我有三妹妹。', tiles: ['我', '有', '三', '个', '妹妹'], extra: ['的'], answers: ['我有三个妹妹。 | Wǒ yǒu sān ge mèimei.'], note: 'Mezi číslo a věc patří měrné slovo 个.' },
      ],
    },
  ],
  4: [
    {
      id: 'A', type: 'build', title: 'Napiš čínsky.', keypad: [...NUMBERS, '两', '点', '半', '分', '星期', '天', '日'],
      items: [
        { prompt: '8:00', answers: ['八点 | bā diǎn'] },
        { prompt: '10:30', answers: ['十点半 | shí diǎn bàn', '十点三十分 | shí diǎn sānshí fēn'] },
        { prompt: '2:15', answers: ['两点十五分 | liǎng diǎn shíwǔ fēn', '两点十五 | liǎng diǎn shíwǔ'], note: 'Dvě hodiny jsou 两点, ne 二点.' },
        { prompt: 'středa', answers: ['星期三 | xīngqīsān'] },
        { prompt: 'neděle', answers: ['星期天 | xīngqītiān', '星期日 | xīngqīrì'] },
      ],
    },
    {
      id: 'B', type: 'build', title: 'Seřaď slova do správné věty.',
      items: [
        { prompt: '喝咖啡 / 我 / 明天上午', tiles: ['喝咖啡', '我', '明天上午'], answers: ['我明天上午喝咖啡。 | Wǒ míngtiān shàngwǔ hē kāfēi.', '明天上午我喝咖啡。 | Míngtiān shàngwǔ wǒ hē kāfēi.'], note: 'Čas stojí před slovesem: hned za podmětem, nebo na začátku věty.' },
        { prompt: '上课 / 星期一 / 他', tiles: ['上课', '星期一', '他'], answers: ['他星期一上课。 | Tā xīngqīyī shàngkè.', '星期一他上课。 | Xīngqīyī tā shàngkè.'] },
        { prompt: '有空 / 你 / 今天晚上 / 吗', tiles: ['有空', '你', '今天晚上', '吗'], answers: ['你今天晚上有空吗？ | Nǐ jīntiān wǎnshang yǒu kòng ma?', '今天晚上你有空吗？ | Jīntiān wǎnshang nǐ yǒu kòng ma?'] },
      ],
    },
    {
      id: 'C', type: 'build', title: 'Přelož do čínštiny.',
      items: [
        { prompt: 'Dnes je středa.', tiles: ['今天', '星期', '三'], extra: ['是', '明天', '四'], answers: ['今天星期三。 | Jīntiān xīngqīsān.', '今天是星期三。 | Jīntiān shì xīngqīsān.'] },
        { prompt: 'Máš v sobotu čas?', tiles: ['你', '星期六', '有空', '吗'], extra: ['星期天', '呢'], answers: ['你星期六有空吗？ | Nǐ xīngqīliù yǒu kòng ma?', '星期六你有空吗？ | Xīngqīliù nǐ yǒu kòng ma?'] },
        { prompt: 'Pojďme spolu na kafe!', tiles: ['我们', '一起', '喝', '咖啡', '吧'], extra: ['吗', '了'], answers: ['我们一起喝咖啡吧！ | Wǒmen yìqǐ hē kāfēi ba!'], note: '吧 na konci věty dělá z oznámení návrh.' },
      ],
    },
  ],
  5: [
    {
      id: 'A', type: 'choice', title: 'Doplň měrné slovo.', options: ['杯', '碗', '位', '个'],
      items: [
        { prompt: '一___茶', answer: '杯', full: '一杯茶 | yì bēi chá', note: '杯 je šálek nebo sklenice.' },
        { prompt: '两___米饭', answer: '碗', full: '两碗米饭 | liǎng wǎn mǐfàn', note: '碗 je miska.' },
        { prompt: '三___ (hosté v restauraci, zdvořile)', answer: '位', full: '三位 | sān wèi', note: '位 je zdvořilé měrné slovo pro lidi.' },
      ],
    },
    {
      id: 'B', type: 'build', title: 'Přelož do čínštiny.',
      items: [
        { prompt: 'Dám si misku nudlí.', tiles: ['我', '要', '一', '碗', '面条'], extra: ['杯', '个'], answers: ['我要一碗面条。 | Wǒ yào yì wǎn miàntiáo.'] },
        { prompt: 'Chceš čaj, nebo kafe?', tiles: ['你', '要', '茶', '还是', '咖啡'], extra: ['吗', '和'], answers: ['你要茶还是咖啡？ | Nǐ yào chá háishì kāfēi?', '你要咖啡还是茶？ | Nǐ yào kāfēi háishì chá?'], note: 'V otázce s 还是 na konci není 吗.' },
        { prompt: 'To je hrozně pálivé!', tiles: ['太', '辣', '了'], extra: ['很', '吗'], answers: ['太辣了！ | Tài là le!'] },
      ],
    },
    {
      id: 'C', type: 'sort', title: 'Roztřiď znaky podle radikálu.',
      groups: [{ key: '饣', label: 'jídlo' }, { key: '氵', label: 'voda' }, { key: '艹', label: 'rostlina' }],
      items: [
        { zh: '饭', group: '饣' }, { zh: '茶', group: '艹' }, { zh: '酒', group: '氵' },
        { zh: '饺', group: '饣' }, { zh: '汤', group: '氵' }, { zh: '菜', group: '艹' },
      ],
    },
  ],
  6: [
    {
      id: 'A', type: 'build', title: 'Napiš ceny čínsky (s 块).', keypad: [...NUMBERS, '两', '百', '块'],
      items: [
        { prompt: '¥8', answers: ['八块 | bā kuài'] },
        { prompt: '¥25', answers: ['二十五块 | èrshíwǔ kuài'] },
        { prompt: '¥150', answers: ['一百五十块 | yìbǎi wǔshí kuài', '一百五 | yìbǎi wǔ'], note: 'Hovorově stačí 一百五: poslední nula se nevyslovuje.' },
        { prompt: '¥200', answers: ['两百块 | liǎng bǎi kuài', '二百块 | èrbǎi kuài'], note: 'Běžnější je 两百, ale 二百 je taky správně.' },
      ],
    },
    {
      id: 'B', type: 'choice', title: 'Doplň 有一点儿, nebo 一点儿.', options: ['有一点儿', '一点儿'],
      items: [
        { prompt: '这件衣服___贵。', answer: '有一点儿', full: '这件衣服有一点儿贵。 | Zhè jiàn yīfu yǒu yìdiǎnr guì.', note: 'Stížnost: je to trochu (moc) drahé, proto 有一点儿 před přídavným jménem.' },
        { prompt: '便宜___吧！', answer: '一点儿', full: '便宜一点儿吧！ | Piányi yìdiǎnr ba!', note: 'Přání: trochu levněji, proto 一点儿 za přídavným jménem.' },
        { prompt: '我要大___的。', answer: '一点儿', full: '我要大一点儿的。 | Wǒ yào dà yìdiǎnr de.', note: 'Srovnání: trochu větší, proto 一点儿 za přídavným jménem.' },
      ],
    },
    {
      id: 'C', type: 'build', title: 'Přelož do čínštiny.',
      items: [
        { prompt: 'Kolik stojí tohle?', tiles: ['这', '个', '多少', '钱'], extra: ['几', '吗'], answers: ['这个多少钱？ | Zhège duōshao qián?', '这多少钱？ | Zhè duōshao qián?'] },
        { prompt: 'Můžu si to vyzkoušet?', tiles: ['我', '可以', '试试', '吗'], extra: ['会', '呢'], answers: ['我可以试试吗？ | Wǒ kěyǐ shìshi ma?', '可以试试吗？ | Kěyǐ shìshi ma?'] },
        { prompt: 'Chci tu bílou.', tiles: ['我', '要', '白', '的'], extra: ['黑', '是'], answers: ['我要白的。 | Wǒ yào bái de.'] },
      ],
    },
  ],
  7: [
    {
      id: 'A', type: 'choice', title: 'Doplň 在, nebo 有.', options: ['在', '有'],
      items: [
        { prompt: '洗手间___哪儿？', answer: '在', full: '洗手间在哪儿？ | Xǐshǒujiān zài nǎr?', note: 'Víš, co hledáš, a ptáš se KDE: věc + 在 + místo.' },
        { prompt: '附近___银行吗？', answer: '有', full: '附近有银行吗？ | Fùjìn yǒu yínháng ma?', note: 'Ptáš se, JESTLI tam něco je: místo + 有 + věc.' },
        { prompt: '超市___银行对面。', answer: '在', full: '超市在银行对面。 | Chāoshì zài yínháng duìmiàn.', note: 'Věc + 在 + místo.' },
      ],
    },
    {
      id: 'B', type: 'build', title: 'Přelož do čínštiny.',
      items: [
        { prompt: 'Supermarket je vedle banky.', tiles: ['超市', '在', '银行', '旁边'], extra: ['有', '对面'], answers: ['超市在银行旁边。 | Chāoshì zài yínháng pángbiān.'], note: 'Místní slovo stojí za podstatným jménem: 银行旁边 = vedle banky.' },
        { prompt: 'Jak se dostanu na stanici metra?', tiles: ['地铁站', '怎么', '走'], extra: ['去', '哪儿'], answers: ['地铁站怎么走？ | Dìtiězhàn zěnme zǒu?', '去地铁站怎么走？ | Qù dìtiězhàn zěnme zǒu?'] },
        { prompt: 'Je to daleko odsud?', tiles: ['离', '这儿', '远', '吗'], extra: ['近', '在'], answers: ['离这儿远吗？ | Lí zhèr yuǎn ma?'] },
      ],
    },
    {
      id: 'C', type: 'pick', title: 'Ve kterých znacích najdeš radikál 辶 (chůze)?',
      chars: ['这', '远', '说', '还', '近', '好'], answer: ['这', '远', '还', '近'],
      note: '说 má 讠 (řeč), 好 má 女 (žena).',
    },
  ],
  8: [
    {
      id: 'A', type: 'build', title: 'Přelož do čínštiny.',
      items: [
        { prompt: 'Včera jsem byl v supermarketu.', tiles: ['我', '昨天', '去', '超市', '了'], extra: ['没', '不'], answers: ['我昨天去超市了。 | Wǒ zuótiān qù chāoshì le.', '昨天我去超市了。 | Zuótiān wǒ qù chāoshì le.', '我昨天去了超市。 | Wǒ zuótiān qùle chāoshì.', '昨天我去了超市。 | Zuótiān wǒ qùle chāoshì.'] },
        { prompt: 'Včera jsem nebyl v práci.', tiles: ['我', '昨天', '没', '去', '上班'], extra: ['不', '了'], answers: ['我昨天没去上班。 | Wǒ zuótiān méi qù shàngbān.', '昨天我没去上班。 | Zuótiān wǒ méi qù shàngbān.', '我昨天没上班。 | Wǒ zuótiān méi shàngbān.', '昨天我没上班。 | Zuótiān wǒ méi shàngbān.'], note: 'Minulost se zapírá 没 a 了 v záporu zmizí.' },
        { prompt: 'Příští víkend se chystám cestovat.', tiles: ['下个', '周末', '我', '打算', '去', '旅游'], extra: ['上个', '了'], answers: ['下个周末我打算去旅游。 | Xià ge zhōumò wǒ dǎsuàn qù lǚyóu.', '我下个周末打算去旅游。 | Wǒ xià ge zhōumò dǎsuàn qù lǚyóu.', '下个周末我打算旅游。 | Xià ge zhōumò wǒ dǎsuàn lǚyóu.', '我下个周末打算旅游。 | Wǒ xià ge zhōumò dǎsuàn lǚyóu.'] },
      ],
    },
    {
      id: 'B', type: 'build', title: 'Seřaď slova do správné věty.',
      items: [
        { prompt: '跑步 / 我 / 常常', tiles: ['跑步', '我', '常常'], answers: ['我常常跑步。 | Wǒ chángcháng pǎobù.'] },
        { prompt: '喜欢 / 他 / 看书 / 不太', tiles: ['喜欢', '他', '看书', '不太'], answers: ['他不太喜欢看书。 | Tā bú tài xǐhuan kàn shū.'] },
        { prompt: '看电影 / 我 / 跟朋友一起 / 明天晚上', tiles: ['看电影', '我', '跟朋友一起', '明天晚上'], answers: ['我明天晚上跟朋友一起看电影。 | Wǒ míngtiān wǎnshang gēn péngyou yìqǐ kàn diànyǐng.', '明天晚上我跟朋友一起看电影。 | Míngtiān wǎnshang wǒ gēn péngyou yìqǐ kàn diànyǐng.'], note: 'Kdo – Kdy – S kým – Co dělá.' },
      ],
    },
    {
      id: 'C', type: 'build', title: 'Najdi chybu a oprav ji.', fix: true,
      items: [
        { prompt: '我昨天不去上班。', tiles: ['我', '昨天', '没', '去', '上班'], extra: ['不'], answers: ['我昨天没去上班。 | Wǒ zuótiān méi qù shàngbān.'], note: 'Minulost se zapírá 没, ne 不.' },
        { prompt: '我没看了电影。', tiles: ['我', '没', '看', '电影'], extra: ['了'], answers: ['我没看电影。 | Wǒ méi kàn diànyǐng.'], note: 'V záporu minulosti 了 zmizí.' },
        { prompt: '我喜欢常常跑步。', tiles: ['我', '喜欢', '常常', '跑步'], extra: ['很'], answers: ['我常常跑步。 | Wǒ chángcháng pǎobù.', '我很喜欢跑步。 | Wǒ hěn xǐhuan pǎobù.', '我喜欢跑步。 | Wǒ xǐhuan pǎobù.'], note: '常常 patří před hlavní sloveso, ne za 喜欢.' },
      ],
    },
    {
      id: 'D', type: 'write', title: 'Napiš o sobě pět vět.',
      hints: [
        'Kdo jsi: 我叫……。我是……。',
        'Odkud jsi: 我是……人。',
        'Co rád děláš: 我喜欢……。',
        'Co jsi dělal minulý víkend: 上个周末我……了。',
        'Co chystáš na příští: 下个周末我打算……。',
      ],
      note: 'Zkontroluj, jestli máš čas a místo před slovesem. Když to zvládneš, máš za sebou základy čínštiny.',
    },
  ],
};
