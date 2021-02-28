/**
 * Known preset layouts to measure against
 */
const Layout = require('./layout');

const presets = {
  JUCUKEN: `
   ~ 1 2 3 4 5 6 7 8 9 0 - =
   ~ ! @ # ; % : ? * ( ) _ +
     й ц у к е н г ш щ з х \` \\
     Й Ц У К Е Н Г Ш Щ З Х \" |
     ф ы в а п р о л д ж э \\n
     Ф Ы В А П Р О Л Д Ж Э \\n
      я ч с м и т ь б ю .
      Я Ч С М И Т ъ Б Ю ,
  `,
  DIKTOR: `
  ~ 1 2 3 4 5 6 7 8 9 0 * =
   ~ Ъ Ь # % : ; - " * ( ) _ +
     ц ь я , . з в к д ч ш щ \\
     Ц ъ Я ? ! З В К Д Ч Ш Щ |
     у и е о а л н т с р й \\n
     У И Е О А Л Н Т С Р Й \\n
      ф э х ы ю б м п г ж
      Ф Э Х Ы Ю Б М П Г Ж
  `,
  DIKTOR_M1: `
  ~ 1 2 3 4 5 6 7 8 9 0 * =
   ~ Ъ Ь # % : ; - " * ( ) _ +
     й у и я ф п ж р . ш ц \` \\
     Й У И Я Ф П Ж Р , Ш Ц \` |
     в е а о ч г т н с д б \\n
     В Е А О Ч Г Т Н С Д Б \\n
      ь э ю ы щ х к л з м
      ъ Э Ю Ы Щ Х К Л З М
  `,
  JUCUKEN_OPTOZORAX: `
   ~ 1 2 3 4 5 6 7 8 9 0 - =
   ~ ! ; # : = , . ? ( ) _ +
     й ц у е ф щ г т н з ё \` \\
     Й Ц У Е Ф Щ Г Т Н З Ё \" |
     к м в а п р о л д ж э \\n
     К М В А П Р О Л Д Ж Э \\n
      я ч с и ы ш ь б ю х
      Я Ч С И ы Ш ъ Б Ю Х
  `,

  // CorpalX: `
  // \` 1 2 3 4 5 6 7 8 9 0 - =
  //  ~ ! @ # $ % ^ & * ( ) _ +
  //    q g m l w y f u b ; [ ] \\
  //    Q G M L W Y F U B : { } |
  //    d s t n r i a e o h ' \\n
  //    D S T N R I A E O H " \\n
  //     z x c v j k p , . /
  //     Z X C V J K P < > ?
  // `,
  // Workman: `
  // \` 1 2 3 4 5 6 7 8 9 0 - =
  //  ~ ! @ # $ % ^ & * ( ) _ +
  //    q d r w b j f u p ; [ ] \\
  //    Q D R W B J F U P : { } |
  //    a s h t g y n e o i ' \\n
  //    A S H T G Y N E O I " \\n
  //     z x m c v k l , . /
  //     Z X M C V K L < > ?
  // `,
  // "Workman-P": `
  // \` ! @ # $ % ^ & * ( ) - =
  //  ~ 1 2 3 4 5 6 7 8 9 0 _ +
  //    q d r w b j f u p ; { } \\
  //    Q D R W B J F U P : [ ] |
  //    a s h t g y n e o i ' \\n
  //    A S H T G Y N E O I " \\n
  //     z x m c v k l , . /
  //     Z X M C V K L < > ?
  // `,
  // Colemak: `
  // \` 1 2 3 4 5 6 7 8 9 0 - =
  //  ~ ! @ # $ % ^ & * ( ) _ +
  //    q w f p g j l u y ; [ ] \\
  //    Q W F P G J L U Y : { } |
  //    a r s t d h n e i o ' \\n
  //    A R S T D H N E I O " \\n
  //     z x c v b k m , . /
  //     Z X C V B K M < > ?
  // `,
  // Dvorak: `
  // \` 1 2 3 4 5 6 7 8 9 0 [ ]
  //  ~ ! @ # $ % ^ & * ( ) { }
  //    ' , . p y f g c r l / = \\
  //    " < > P Y F G C R L ? + |
  //    a o e u i d h t n s - \\n
  //    A O E U I D H T N S _ \\n
  //     ; q j k x b m w v z
  //     : Q J K X B M W V Z
  // `
};

for (const name in presets) {
  exports[name] = new Layout(name, presets[name]);
}
