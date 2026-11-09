// Bench Force — тексты интерфейса (ru, uk, en, fr, de, es, pt, zh)
const LANGS = { ru: 'Русский', uk: 'Українська', en: 'English', fr: 'Français', de: 'Deutsch', es: 'Español', pt: 'Português', zh: '中文' };
const I18N = {
ru: {
  sub: 'Программа на жим лёжа', cyc_sub: 'Цикл {n} · 1ПМ {rm} кг', kg: 'кг', rm: '1ПМ',
  nav_today: 'Сегодня', nav_plan: 'План', nav_progress: 'Прогресс', nav_settings: 'Настройки',
  start: 'Начнём 💪', new_cycle: 'Новый цикл', rm_label: 'Ваш 1ПМ в жиме лёжа, кг',
  rm_hint: '1ПМ — максимальный вес, который вы жмёте 1 раз. Если не знаете точно — возьмите честную оценку, программа уточнит её по тестам на 3-й, 6-й и 9-й неделе.',
  calc: 'Рассчитать цикл на 10 недель', preview: 'Предпросмотр цикла', preview_bad: 'Введите 1ПМ от 20 до 400 кг',
  preview_note: 'Проценты — от 1ПМ на этом этапе цикла. С 4-й недели веса уточняются по результатам тестов.',
  wk: 'Нед. {n}', title: 'Неделя {w} · тренировка {d}', rest: 'Отдых', rest_day: 'Отдых 😌',
  work_sets: 'Рабочие подходы', warmup: 'Разминка', work: 'Работа',
  deload: 'Разгрузка: спокойно, следим за техникой.', prelim: 'Вес предварительный: введите результат теста, и программа уточнит его.',
  test_n: 'Тест: выход на {n}ПМ', approx: 'кг × {n} — ориентир', spot: 'Оборудуем страховку!!!',
  test_tip: 'Разминка лесенкой с малыми повторами, затем 2–4 попытки с отдыхом 3–5 минут. Подбирайте вес по самочувствию.',
  best: 'Лучший результат на {n} повт., кг', test_max: 'Тест: вес × максимум повторений', kg_max: 'кг × максимум',
  max_tip: 'Минимум {min}, цель — {top}! Чем ближе к {top}, тем сильнее вырастут веса дальше.',
  reps_q: 'Сколько повторений сделали?', recalc_wait: 'После ввода программа пересчитает следующие недели.',
  recalc_done: 'Расчётный 1ПМ: {v} кг — следующие недели пересчитаны.',
  done: 'Тренировка выполнена', undo: '✓ Выполнено — отменить', note: 'Заметка', note_ph: 'как прошло, самочувствие…',
  cycle: 'Цикл {n}', go_n: 'Выход на {n}ПМ', test: 'тест', result: 'результат {v} кг', x_reps: '× {v} повт.', x_max: '× макс ({min}–{top})',
  fin: 'Цикл завершён 🎉', summary: 'Итог', next_rm: 'кг — 1ПМ для нового цикла', fin_line: 'Старт цикла: {a} кг{t} · расчётный: {c} кг', t1: ' · тест 1ПМ: {v} кг',
  progress: 'Прогресс', nodata: 'Пока нет данных', rm_kg: '1ПМ, кг', p_start: 'старт', p_w: 'н', cyc_line: 'Старт {rm} кг · тренировок {d}/19',
  settings: 'Настройки', gym: 'Гриф и блины в вашем зале', bar: 'Вес грифа, кг',
  plates_hint: 'Отметьте блины, которые есть в зале — веса будут округляться так, чтобы их можно было собрать:',
  cur_cycle: 'Текущий цикл', rm_start: '1ПМ на старте цикла, кг', new_btn: 'Начать новый цикл',
  backup: 'Резервная копия', backup_hint: 'Данные хранятся только на этом телефоне. Сохраните копию, чтобы перенести их на другое устройство.',
  save_copy: 'Сохранить копию', load_copy: 'Загрузить копию', bad_file: 'Не удалось прочитать файл',
  language: 'Язык', per_side: 'на сторону:', empty_bar: 'пустой гриф', plus30: '+30 с', stop: 'Стоп',
  menu: 'Меню', about: 'О программе', howto: 'Как пользоваться', close: 'Закрыть', version: 'Bench Force · пробная версия 0.3',
  about_html: `<p><b>Bench Force</b> — 10-недельная программа развития силы в жиме лёжа, по которой тренер Сергей ведёт своих клиентов.</p>
<p><b>2 тренировки жима в неделю.</b> Первая — тяжёлая: малые повторы (3, 2, 1) с весом 80–93% от 1ПМ. Вторая — объёмная: 5–10 повторов с весом 54–78%.</p>
<p><b>Тесты на 3-й, 6-й и 9-й неделе.</b> В первой тренировке — выход на 3ПМ, 2ПМ и 1ПМ. Во второй — «вес × максимум повторений»: число повторов показывает, насколько вы стали сильнее, и программа пересчитывает веса на следующие недели.</p>
<p><b>10-я неделя — разгрузка</b>, после неё — новый цикл с новым 1ПМ.</p>
<p>Программа ведёт вас от цикла к циклу: веса всегда соответствуют вашей текущей силе.</p>`,
  howto_html: `<p><b>1. Старт.</b> Введите 1ПМ и отметьте гриф и блины своего зала — веса будут округляться так, чтобы их можно было собрать. Нажмите «Рассчитать цикл».</p>
<p><b>2. «Сегодня».</b> Здесь следующая тренировка: разминка лесенкой и рабочие подходы. Под весом написано, какие блины вешать на каждую сторону.</p>
<p><b>3. Подходы и отдых.</b> Отмечайте каждый рабочий подход — запустится таймер отдыха (2–3 минуты). Его можно продлить на 30 секунд или остановить.</p>
<p><b>4. Тесты.</b> На выходе на 3ПМ, 2ПМ, 1ПМ обязательно работайте со страховкой и запишите лучший вес. На «вес × максимум» сделайте как можно больше повторений (минимум и цель указаны) и введите их — веса следующих недель пересчитаются.</p>
<p><b>5. «Тренировка выполнена».</b> Нажмите после тренировки — откроется следующая. Тренировку можно открыть и из «Плана».</p>
<p><b>6. Конец цикла.</b> Программа предложит 1ПМ для нового цикла. История и график — во вкладке «Прогресс».</p>
<p><b>Важно:</b> данные хранятся на телефоне. Перед сменой телефона сохраните резервную копию в «Настройках».</p>`
},
uk: {
  sub: 'Програма на жим лежачи', cyc_sub: 'Цикл {n} · 1ПМ {rm} кг', kg: 'кг', rm: '1ПМ',
  nav_today: 'Сьогодні', nav_plan: 'План', nav_progress: 'Прогрес', nav_settings: 'Налаштування',
  start: 'Почнімо 💪', new_cycle: 'Новий цикл', rm_label: 'Ваш 1ПМ у жимі лежачи, кг',
  rm_hint: '1ПМ — максимальна вага, яку ви жмете 1 раз. Якщо не знаєте точно — візьміть чесну оцінку, програма уточнить її за тестами на 3-му, 6-му і 9-му тижні.',
  calc: 'Розрахувати цикл на 10 тижнів', preview: 'Попередній перегляд циклу', preview_bad: 'Введіть 1ПМ від 20 до 400 кг',
  preview_note: 'Відсотки — від 1ПМ на цьому етапі циклу. З 4-го тижня ваги уточнюються за результатами тестів.',
  wk: 'Тиж. {n}', title: 'Тиждень {w} · тренування {d}', rest: 'Відпочинок', rest_day: 'Відпочинок 😌',
  work_sets: 'Робочі підходи', warmup: 'Розминка', work: 'Робота',
  deload: 'Розвантаження: спокійно, стежимо за технікою.', prelim: 'Вага попередня: введіть результат тесту, і програма її уточнить.',
  test_n: 'Тест: вихід на {n}ПМ', approx: 'кг × {n} — орієнтир', spot: 'Обладнуємо страховку!!!',
  test_tip: 'Розминка драбинкою з малими повторами, потім 2–4 спроби з відпочинком 3–5 хвилин. Підбирайте вагу за самопочуттям.',
  best: 'Найкращий результат на {n} повт., кг', test_max: 'Тест: вага × максимум повторень', kg_max: 'кг × максимум',
  max_tip: 'Мінімум {min}, ціль — {top}! Що ближче до {top}, то сильніше зростуть ваги далі.',
  reps_q: 'Скільки повторень зробили?', recalc_wait: 'Після введення програма перерахує наступні тижні.',
  recalc_done: 'Розрахунковий 1ПМ: {v} кг — наступні тижні перераховано.',
  done: 'Тренування виконано', undo: '✓ Виконано — скасувати', note: 'Нотатка', note_ph: 'як пройшло, самопочуття…',
  cycle: 'Цикл {n}', go_n: 'Вихід на {n}ПМ', test: 'тест', result: 'результат {v} кг', x_reps: '× {v} повт.', x_max: '× макс ({min}–{top})',
  fin: 'Цикл завершено 🎉', summary: 'Підсумок', next_rm: 'кг — 1ПМ для нового циклу', fin_line: 'Старт циклу: {a} кг{t} · розрахунковий: {c} кг', t1: ' · тест 1ПМ: {v} кг',
  progress: 'Прогрес', nodata: 'Поки немає даних', rm_kg: '1ПМ, кг', p_start: 'старт', p_w: 'т', cyc_line: 'Старт {rm} кг · тренувань {d}/19',
  settings: 'Налаштування', gym: 'Гриф і млинці у вашому залі', bar: 'Вага грифа, кг',
  plates_hint: 'Позначте млинці, які є в залі, — ваги округлюватимуться так, щоб їх можна було зібрати:',
  cur_cycle: 'Поточний цикл', rm_start: '1ПМ на старті циклу, кг', new_btn: 'Почати новий цикл',
  backup: 'Резервна копія', backup_hint: 'Дані зберігаються лише на цьому телефоні. Збережіть копію, щоб перенести їх на інший пристрій.',
  save_copy: 'Зберегти копію', load_copy: 'Завантажити копію', bad_file: 'Не вдалося прочитати файл',
  language: 'Мова', per_side: 'на бік:', empty_bar: 'порожній гриф', plus30: '+30 с', stop: 'Стоп',
  menu: 'Меню', about: 'Про програму', howto: 'Як користуватися', close: 'Закрити', version: 'Bench Force · пробна версія 0.3',
  about_html: `<p><b>Bench Force</b> — 10-тижнева програма розвитку сили в жимі лежачи, за якою тренер Сергій веде своїх клієнтів.</p>
<p><b>2 тренування жиму на тиждень.</b> Перше — важке: малі повтори (3, 2, 1) з вагою 80–93% від 1ПМ. Друге — об'ємне: 5–10 повторів з вагою 54–78%.</p>
<p><b>Тести на 3-му, 6-му і 9-му тижні.</b> У першому тренуванні — вихід на 3ПМ, 2ПМ і 1ПМ. У другому — «вага × максимум повторень»: кількість повторів показує, наскільки ви стали сильнішими, і програма перераховує ваги на наступні тижні.</p>
<p><b>10-й тиждень — розвантаження</b>, після нього — новий цикл з новим 1ПМ.</p>
<p>Програма веде вас від циклу до циклу: ваги завжди відповідають вашій поточній силі.</p>`,
  howto_html: `<p><b>1. Старт.</b> Введіть 1ПМ і позначте гриф та млинці свого залу — ваги округлюватимуться так, щоб їх можна було зібрати. Натисніть «Розрахувати цикл».</p>
<p><b>2. «Сьогодні».</b> Тут наступне тренування: розминка драбинкою і робочі підходи. Під вагою написано, які млинці вішати на кожен бік.</p>
<p><b>3. Підходи й відпочинок.</b> Позначайте кожен робочий підхід — запуститься таймер відпочинку (2–3 хвилини). Його можна подовжити на 30 секунд або зупинити.</p>
<p><b>4. Тести.</b> На виході на 3ПМ, 2ПМ, 1ПМ обов'язково працюйте зі страховкою і запишіть найкращу вагу. На «вага × максимум» зробіть якомога більше повторень (мінімум і ціль указані) і введіть їх — ваги наступних тижнів перерахуються.</p>
<p><b>5. «Тренування виконано».</b> Натисніть після тренування — відкриється наступне. Тренування можна відкрити і з «Плану».</p>
<p><b>6. Кінець циклу.</b> Програма запропонує 1ПМ для нового циклу. Історія і графік — у вкладці «Прогрес».</p>
<p><b>Важливо:</b> дані зберігаються на телефоні. Перед зміною телефона збережіть резервну копію в «Налаштуваннях».</p>`
},
en: {
  sub: 'Bench press program', cyc_sub: 'Cycle {n} · 1RM {rm} kg', kg: 'kg', rm: '1RM',
  nav_today: 'Today', nav_plan: 'Plan', nav_progress: 'Progress', nav_settings: 'Settings',
  start: "Let's start 💪", new_cycle: 'New cycle', rm_label: 'Your bench press 1RM, kg',
  rm_hint: '1RM is the maximum weight you can press once. If you are not sure, use an honest estimate — the program will refine it with tests in weeks 3, 6 and 9.',
  calc: 'Build my 10-week cycle', preview: 'Cycle preview', preview_bad: 'Enter a 1RM between 20 and 400 kg',
  preview_note: 'Percentages are of the 1RM at that stage of the cycle. From week 4 the weights are refined by your test results.',
  wk: 'Wk {n}', title: 'Week {w} · session {d}', rest: 'Rest', rest_day: 'Rest day 😌',
  work_sets: 'Working sets', warmup: 'Warm-up', work: 'Work',
  deload: 'Deload: easy, focus on technique.', prelim: 'Preliminary weight: enter your test result and the program will refine it.',
  test_n: 'Test: work up to a {n}RM', approx: 'kg × {n} — estimate', spot: 'Use a spotter!!!',
  test_tip: 'Warm up in a ladder with low reps, then 2–4 attempts with 3–5 minutes rest. Choose the weight by how you feel.',
  best: 'Best weight for {n} reps, kg', test_max: 'Test: weight × max reps', kg_max: 'kg × max reps',
  max_tip: 'Minimum {min}, goal — {top}! The closer to {top}, the more your weights will grow.',
  reps_q: 'How many reps did you do?', recalc_wait: 'After you enter it, the next weeks will be recalculated.',
  recalc_done: 'Estimated 1RM: {v} kg — the next weeks are recalculated.',
  done: 'Session done', undo: '✓ Done — undo', note: 'Note', note_ph: 'how it went, how you felt…',
  cycle: 'Cycle {n}', go_n: 'Work up to {n}RM', test: 'test', result: 'result {v} kg', x_reps: '× {v} reps', x_max: '× max ({min}–{top})',
  fin: 'Cycle complete 🎉', summary: 'Summary', next_rm: 'kg — 1RM for the new cycle', fin_line: 'Cycle start: {a} kg{t} · estimated: {c} kg', t1: ' · 1RM test: {v} kg',
  progress: 'Progress', nodata: 'No data yet', rm_kg: '1RM, kg', p_start: 'start', p_w: 'w', cyc_line: 'Start {rm} kg · sessions {d}/19',
  settings: 'Settings', gym: 'Bar and plates in your gym', bar: 'Bar weight, kg',
  plates_hint: 'Tick the plates your gym has — weights will be rounded so you can actually load them:',
  cur_cycle: 'Current cycle', rm_start: '1RM at the start of the cycle, kg', new_btn: 'Start a new cycle',
  backup: 'Backup', backup_hint: 'Data is stored only on this phone. Save a copy to move it to another device.',
  save_copy: 'Save a copy', load_copy: 'Load a copy', bad_file: 'Could not read the file',
  language: 'Language', per_side: 'per side:', empty_bar: 'empty bar', plus30: '+30 s', stop: 'Stop',
  menu: 'Menu', about: 'About the program', howto: 'How to use', close: 'Close', version: 'Bench Force · trial version 0.3',
  about_html: `<p><b>Bench Force</b> is a 10-week bench press strength program that coach Serhii uses with his clients.</p>
<p><b>2 bench sessions a week.</b> The first is heavy: low reps (3, 2, 1) at 80–93% of 1RM. The second is volume: 5–10 reps at 54–78%.</p>
<p><b>Tests in weeks 3, 6 and 9.</b> In the first session you work up to a 3RM, 2RM and 1RM. In the second — "weight × max reps": the number of reps shows how much stronger you have become, and the program recalculates the following weeks.</p>
<p><b>Week 10 is a deload</b>, followed by a new cycle with a new 1RM.</p>
<p>The program takes you from cycle to cycle, so the weights always match your current strength.</p>`,
  howto_html: `<p><b>1. Start.</b> Enter your 1RM and tick your gym's bar and plates — weights will be rounded so you can load them. Tap "Build my cycle".</p>
<p><b>2. "Today".</b> Your next session: a warm-up ladder and working sets. Under each weight you see which plates to put on each side.</p>
<p><b>3. Sets and rest.</b> Tick every working set — a rest timer starts (2–3 minutes). You can add 30 seconds or stop it.</p>
<p><b>4. Tests.</b> When working up to a 3RM, 2RM or 1RM always use a spotter and record your best weight. For "weight × max reps" do as many reps as you can (minimum and goal are shown) and enter them — the next weeks will be recalculated.</p>
<p><b>5. "Session done".</b> Tap it after training — the next session opens. You can also open any session from "Plan".</p>
<p><b>6. End of cycle.</b> The program suggests a 1RM for the new cycle. History and chart are in "Progress".</p>
<p><b>Important:</b> data is stored on your phone. Before changing phones, save a backup in "Settings".</p>`
},
fr: {
  sub: 'Programme de développé couché', cyc_sub: 'Cycle {n} · 1RM {rm} kg', kg: 'kg', rm: '1RM',
  nav_today: "Aujourd'hui", nav_plan: 'Plan', nav_progress: 'Progrès', nav_settings: 'Réglages',
  start: 'C’est parti 💪', new_cycle: 'Nouveau cycle', rm_label: 'Votre 1RM au développé couché, kg',
  rm_hint: 'Le 1RM est la charge maximale que vous poussez une fois. Si vous ne le connaissez pas exactement, faites une estimation honnête — le programme l’affinera grâce aux tests des semaines 3, 6 et 9.',
  calc: 'Calculer le cycle de 10 semaines', preview: 'Aperçu du cycle', preview_bad: 'Entrez un 1RM entre 20 et 400 kg',
  preview_note: 'Les pourcentages sont calculés sur le 1RM de cette étape du cycle. À partir de la semaine 4, les charges sont ajustées selon vos tests.',
  wk: 'Sem. {n}', title: 'Semaine {w} · séance {d}', rest: 'Repos', rest_day: 'Repos 😌',
  work_sets: 'Séries de travail', warmup: 'Échauffement', work: 'Travail',
  deload: 'Décharge : tranquillement, on soigne la technique.', prelim: 'Charge provisoire : entrez le résultat du test et le programme l’ajustera.',
  test_n: 'Test : montée au {n}RM', approx: 'kg × {n} — repère', spot: 'Avec un pareur !!!',
  test_tip: 'Échauffement en escalier avec peu de répétitions, puis 2–4 tentatives avec 3–5 minutes de repos. Choisissez la charge selon vos sensations.',
  best: 'Meilleure charge pour {n} rép., kg', test_max: 'Test : charge × max de répétitions', kg_max: 'kg × max',
  max_tip: 'Minimum {min}, objectif — {top} ! Plus vous approchez de {top}, plus les charges augmenteront ensuite.',
  reps_q: 'Combien de répétitions avez-vous faites ?', recalc_wait: 'Après la saisie, les semaines suivantes seront recalculées.',
  recalc_done: '1RM estimé : {v} kg — semaines suivantes recalculées.',
  done: 'Séance terminée', undo: '✓ Terminée — annuler', note: 'Note', note_ph: 'comment ça s’est passé, sensations…',
  cycle: 'Cycle {n}', go_n: 'Montée au {n}RM', test: 'test', result: 'résultat {v} kg', x_reps: '× {v} rép.', x_max: '× max ({min}–{top})',
  fin: 'Cycle terminé 🎉', summary: 'Bilan', next_rm: 'kg — 1RM pour le nouveau cycle', fin_line: 'Début du cycle : {a} kg{t} · estimé : {c} kg', t1: ' · test 1RM : {v} kg',
  progress: 'Progrès', nodata: 'Pas encore de données', rm_kg: '1RM, kg', p_start: 'début', p_w: 's', cyc_line: 'Début {rm} kg · séances {d}/19',
  settings: 'Réglages', gym: 'Barre et disques de votre salle', bar: 'Poids de la barre, kg',
  plates_hint: 'Cochez les disques disponibles dans votre salle — les charges seront arrondies pour pouvoir être montées :',
  cur_cycle: 'Cycle en cours', rm_start: '1RM au début du cycle, kg', new_btn: 'Commencer un nouveau cycle',
  backup: 'Sauvegarde', backup_hint: 'Les données sont stockées uniquement sur ce téléphone. Enregistrez une copie pour les transférer sur un autre appareil.',
  save_copy: 'Enregistrer une copie', load_copy: 'Charger une copie', bad_file: 'Impossible de lire le fichier',
  language: 'Langue', per_side: 'par côté :', empty_bar: 'barre à vide', plus30: '+30 s', stop: 'Stop',
  menu: 'Menu', about: 'À propos du programme', howto: 'Mode d’emploi', close: 'Fermer', version: 'Bench Force · version d’essai 0.3',
  about_html: `<p><b>Bench Force</b> est un programme de 10 semaines pour développer la force au développé couché, utilisé par le coach Serhii avec ses clients.</p>
<p><b>2 séances de développé par semaine.</b> La première est lourde : peu de répétitions (3, 2, 1) à 80–93 % du 1RM. La seconde est en volume : 5–10 répétitions à 54–78 %.</p>
<p><b>Tests aux semaines 3, 6 et 9.</b> Dans la première séance, montée au 3RM, 2RM et 1RM. Dans la seconde, « charge × max de répétitions » : le nombre de répétitions montre vos progrès, et le programme recalcule les semaines suivantes.</p>
<p><b>La semaine 10 est une décharge</b>, puis vient un nouveau cycle avec un nouveau 1RM.</p>
<p>Le programme vous accompagne de cycle en cycle : les charges correspondent toujours à votre force actuelle.</p>`,
  howto_html: `<p><b>1. Démarrage.</b> Entrez votre 1RM et cochez la barre et les disques de votre salle — les charges seront arrondies pour pouvoir être montées. Appuyez sur « Calculer le cycle ».</p>
<p><b>2. « Aujourd’hui ».</b> Votre prochaine séance : échauffement en escalier et séries de travail. Sous chaque charge, les disques à mettre de chaque côté.</p>
<p><b>3. Séries et repos.</b> Cochez chaque série de travail — un minuteur de repos démarre (2–3 minutes). Vous pouvez ajouter 30 secondes ou l’arrêter.</p>
<p><b>4. Tests.</b> Pour la montée au 3RM, 2RM ou 1RM, travaillez toujours avec un pareur et notez votre meilleure charge. Pour « charge × max », faites le plus de répétitions possible (minimum et objectif indiqués) et saisissez-les — les semaines suivantes seront recalculées.</p>
<p><b>5. « Séance terminée ».</b> Appuyez après l’entraînement — la séance suivante s’ouvre. Vous pouvez aussi ouvrir une séance depuis « Plan ».</p>
<p><b>6. Fin du cycle.</b> Le programme propose un 1RM pour le nouveau cycle. Historique et graphique dans « Progrès ».</p>
<p><b>Important :</b> les données sont stockées sur le téléphone. Avant de changer de téléphone, faites une sauvegarde dans « Réglages ».</p>`
},
de: {
  sub: 'Bankdrück-Programm', cyc_sub: 'Zyklus {n} · 1RM {rm} kg', kg: 'kg', rm: '1RM',
  nav_today: 'Heute', nav_plan: 'Plan', nav_progress: 'Fortschritt', nav_settings: 'Einstellungen',
  start: 'Los geht’s 💪', new_cycle: 'Neuer Zyklus', rm_label: 'Dein 1RM im Bankdrücken, kg',
  rm_hint: 'Das 1RM ist das Maximalgewicht, das du einmal drücken kannst. Wenn du es nicht genau weißt, schätze ehrlich — das Programm präzisiert es durch die Tests in Woche 3, 6 und 9.',
  calc: '10-Wochen-Zyklus berechnen', preview: 'Zyklus-Vorschau', preview_bad: 'Gib ein 1RM zwischen 20 und 400 kg ein',
  preview_note: 'Prozente beziehen sich auf das 1RM in diesem Abschnitt. Ab Woche 4 werden die Gewichte anhand deiner Tests angepasst.',
  wk: 'W {n}', title: 'Woche {w} · Einheit {d}', rest: 'Pause', rest_day: 'Ruhetag 😌',
  work_sets: 'Arbeitssätze', warmup: 'Aufwärmen', work: 'Arbeit',
  deload: 'Deload: locker, auf die Technik achten.', prelim: 'Vorläufiges Gewicht: Trage dein Testergebnis ein, dann wird es angepasst.',
  test_n: 'Test: Steigern bis zum {n}RM', approx: 'kg × {n} — Richtwert', spot: 'Mit Sicherung!!!',
  test_tip: 'Pyramidenförmig mit wenigen Wiederholungen aufwärmen, dann 2–4 Versuche mit 3–5 Minuten Pause. Gewicht nach Gefühl wählen.',
  best: 'Bestes Gewicht für {n} Wdh., kg', test_max: 'Test: Gewicht × maximale Wiederholungen', kg_max: 'kg × max',
  max_tip: 'Minimum {min}, Ziel — {top}! Je näher an {top}, desto stärker steigen die Gewichte danach.',
  reps_q: 'Wie viele Wiederholungen hast du geschafft?', recalc_wait: 'Nach der Eingabe werden die nächsten Wochen neu berechnet.',
  recalc_done: 'Geschätztes 1RM: {v} kg — die nächsten Wochen sind neu berechnet.',
  done: 'Einheit erledigt', undo: '✓ Erledigt — rückgängig', note: 'Notiz', note_ph: 'wie lief es, wie ging es dir…',
  cycle: 'Zyklus {n}', go_n: 'Steigern bis {n}RM', test: 'Test', result: 'Ergebnis {v} kg', x_reps: '× {v} Wdh.', x_max: '× max ({min}–{top})',
  fin: 'Zyklus abgeschlossen 🎉', summary: 'Ergebnis', next_rm: 'kg — 1RM für den neuen Zyklus', fin_line: 'Zyklusstart: {a} kg{t} · geschätzt: {c} kg', t1: ' · 1RM-Test: {v} kg',
  progress: 'Fortschritt', nodata: 'Noch keine Daten', rm_kg: '1RM, kg', p_start: 'Start', p_w: 'W', cyc_line: 'Start {rm} kg · Einheiten {d}/19',
  settings: 'Einstellungen', gym: 'Stange und Scheiben in deinem Studio', bar: 'Gewicht der Stange, kg',
  plates_hint: 'Markiere die Scheiben, die es in deinem Studio gibt — die Gewichte werden so gerundet, dass du sie auflegen kannst:',
  cur_cycle: 'Aktueller Zyklus', rm_start: '1RM zu Beginn des Zyklus, kg', new_btn: 'Neuen Zyklus starten',
  backup: 'Sicherung', backup_hint: 'Die Daten werden nur auf diesem Handy gespeichert. Speichere eine Kopie, um sie auf ein anderes Gerät zu übertragen.',
  save_copy: 'Kopie speichern', load_copy: 'Kopie laden', bad_file: 'Datei konnte nicht gelesen werden',
  language: 'Sprache', per_side: 'pro Seite:', empty_bar: 'leere Stange', plus30: '+30 s', stop: 'Stopp',
  menu: 'Menü', about: 'Über das Programm', howto: 'Anleitung', close: 'Schließen', version: 'Bench Force · Testversion 0.3',
  about_html: `<p><b>Bench Force</b> ist ein 10-wöchiges Programm für mehr Kraft im Bankdrücken, mit dem Coach Serhii seine Kunden trainiert.</p>
<p><b>2 Bankdrück-Einheiten pro Woche.</b> Die erste ist schwer: wenige Wiederholungen (3, 2, 1) mit 80–93 % des 1RM. Die zweite ist Volumen: 5–10 Wiederholungen mit 54–78 %.</p>
<p><b>Tests in Woche 3, 6 und 9.</b> In der ersten Einheit steigerst du bis zum 3RM, 2RM und 1RM. In der zweiten — „Gewicht × maximale Wiederholungen“: die Zahl zeigt, wie viel stärker du geworden bist, und das Programm berechnet die folgenden Wochen neu.</p>
<p><b>Woche 10 ist ein Deload</b>, danach folgt ein neuer Zyklus mit neuem 1RM.</p>
<p>Das Programm begleitet dich von Zyklus zu Zyklus: Die Gewichte passen immer zu deiner aktuellen Kraft.</p>`,
  howto_html: `<p><b>1. Start.</b> Gib dein 1RM ein und markiere Stange und Scheiben deines Studios — die Gewichte werden so gerundet, dass du sie auflegen kannst. Tippe auf „Zyklus berechnen“.</p>
<p><b>2. „Heute“.</b> Deine nächste Einheit: Aufwärm-Pyramide und Arbeitssätze. Unter jedem Gewicht steht, welche Scheiben auf jede Seite kommen.</p>
<p><b>3. Sätze und Pause.</b> Hake jeden Arbeitssatz ab — ein Pausen-Timer startet (2–3 Minuten). Du kannst 30 Sekunden hinzufügen oder ihn stoppen.</p>
<p><b>4. Tests.</b> Beim Steigern bis zum 3RM, 2RM oder 1RM immer mit Sicherung trainieren und das beste Gewicht eintragen. Bei „Gewicht × max“ so viele Wiederholungen wie möglich (Minimum und Ziel stehen da) und eintragen — die nächsten Wochen werden neu berechnet.</p>
<p><b>5. „Einheit erledigt“.</b> Nach dem Training antippen — die nächste Einheit öffnet sich. Jede Einheit lässt sich auch im „Plan“ öffnen.</p>
<p><b>6. Zyklusende.</b> Das Programm schlägt ein 1RM für den neuen Zyklus vor. Verlauf und Diagramm unter „Fortschritt“.</p>
<p><b>Wichtig:</b> Die Daten liegen auf dem Handy. Vor einem Handywechsel in den „Einstellungen“ eine Sicherung speichern.</p>`
},
es: {
  sub: 'Programa de press de banca', cyc_sub: 'Ciclo {n} · 1RM {rm} kg', kg: 'kg', rm: '1RM',
  nav_today: 'Hoy', nav_plan: 'Plan', nav_progress: 'Progreso', nav_settings: 'Ajustes',
  start: 'Empecemos 💪', new_cycle: 'Nuevo ciclo', rm_label: 'Tu 1RM en press de banca, kg',
  rm_hint: 'El 1RM es el peso máximo que levantas una vez. Si no lo sabes con exactitud, haz una estimación honesta: el programa lo ajustará con los tests de las semanas 3, 6 y 9.',
  calc: 'Calcular ciclo de 10 semanas', preview: 'Vista previa del ciclo', preview_bad: 'Introduce un 1RM entre 20 y 400 kg',
  preview_note: 'Los porcentajes son del 1RM en esa etapa del ciclo. A partir de la semana 4 los pesos se ajustan según tus tests.',
  wk: 'Sem. {n}', title: 'Semana {w} · sesión {d}', rest: 'Descanso', rest_day: 'Descanso 😌',
  work_sets: 'Series de trabajo', warmup: 'Calentamiento', work: 'Trabajo',
  deload: 'Descarga: tranquilo, cuidando la técnica.', prelim: 'Peso provisional: introduce el resultado del test y el programa lo ajustará.',
  test_n: 'Test: subir al {n}RM', approx: 'kg × {n} — referencia', spot: '¡¡¡Con ayudante!!!',
  test_tip: 'Calentamiento en escalera con pocas repeticiones, luego 2–4 intentos con 3–5 minutos de descanso. Elige el peso según cómo te sientas.',
  best: 'Mejor peso para {n} rep., kg', test_max: 'Test: peso × máximo de repeticiones', kg_max: 'kg × máximo',
  max_tip: 'Mínimo {min}, objetivo — {top}! Cuanto más cerca de {top}, más subirán los pesos después.',
  reps_q: '¿Cuántas repeticiones hiciste?', recalc_wait: 'Al introducirlo, se recalcularán las semanas siguientes.',
  recalc_done: '1RM estimado: {v} kg — semanas siguientes recalculadas.',
  done: 'Sesión hecha', undo: '✓ Hecha — deshacer', note: 'Nota', note_ph: 'cómo fue, cómo te sentiste…',
  cycle: 'Ciclo {n}', go_n: 'Subir al {n}RM', test: 'test', result: 'resultado {v} kg', x_reps: '× {v} rep.', x_max: '× máx ({min}–{top})',
  fin: 'Ciclo completado 🎉', summary: 'Resumen', next_rm: 'kg — 1RM para el nuevo ciclo', fin_line: 'Inicio del ciclo: {a} kg{t} · estimado: {c} kg', t1: ' · test 1RM: {v} kg',
  progress: 'Progreso', nodata: 'Aún no hay datos', rm_kg: '1RM, kg', p_start: 'inicio', p_w: 's', cyc_line: 'Inicio {rm} kg · sesiones {d}/19',
  settings: 'Ajustes', gym: 'Barra y discos de tu gimnasio', bar: 'Peso de la barra, kg',
  plates_hint: 'Marca los discos que hay en tu gimnasio: los pesos se redondearán para que puedas cargarlos:',
  cur_cycle: 'Ciclo actual', rm_start: '1RM al inicio del ciclo, kg', new_btn: 'Empezar un nuevo ciclo',
  backup: 'Copia de seguridad', backup_hint: 'Los datos se guardan solo en este teléfono. Guarda una copia para pasarlos a otro dispositivo.',
  save_copy: 'Guardar copia', load_copy: 'Cargar copia', bad_file: 'No se pudo leer el archivo',
  language: 'Idioma', per_side: 'por lado:', empty_bar: 'barra vacía', plus30: '+30 s', stop: 'Parar',
  menu: 'Menú', about: 'Sobre el programa', howto: 'Cómo usarlo', close: 'Cerrar', version: 'Bench Force · versión de prueba 0.3',
  about_html: `<p><b>Bench Force</b> es un programa de 10 semanas para ganar fuerza en press de banca, con el que el entrenador Serhii trabaja con sus clientes.</p>
<p><b>2 sesiones de press por semana.</b> La primera es pesada: pocas repeticiones (3, 2, 1) con el 80–93 % del 1RM. La segunda es de volumen: 5–10 repeticiones con el 54–78 %.</p>
<p><b>Tests en las semanas 3, 6 y 9.</b> En la primera sesión subes al 3RM, 2RM y 1RM. En la segunda, «peso × máximo de repeticiones»: el número muestra cuánto has mejorado y el programa recalcula las semanas siguientes.</p>
<p><b>La semana 10 es de descarga</b> y después empieza un nuevo ciclo con un nuevo 1RM.</p>
<p>El programa te acompaña de ciclo en ciclo: los pesos siempre corresponden a tu fuerza actual.</p>`,
  howto_html: `<p><b>1. Inicio.</b> Introduce tu 1RM y marca la barra y los discos de tu gimnasio: los pesos se redondearán para que puedas cargarlos. Pulsa «Calcular ciclo».</p>
<p><b>2. «Hoy».</b> Tu próxima sesión: calentamiento en escalera y series de trabajo. Bajo cada peso verás qué discos poner en cada lado.</p>
<p><b>3. Series y descanso.</b> Marca cada serie de trabajo: arranca un temporizador de descanso (2–3 minutos). Puedes añadir 30 segundos o pararlo.</p>
<p><b>4. Tests.</b> Al subir al 3RM, 2RM o 1RM trabaja siempre con ayudante y anota tu mejor peso. En «peso × máximo» haz todas las repeticiones que puedas (mínimo y objetivo indicados) e introdúcelas: se recalcularán las semanas siguientes.</p>
<p><b>5. «Sesión hecha».</b> Púlsalo al terminar: se abre la siguiente sesión. También puedes abrir cualquier sesión desde «Plan».</p>
<p><b>6. Fin del ciclo.</b> El programa propone un 1RM para el nuevo ciclo. Historial y gráfico en «Progreso».</p>
<p><b>Importante:</b> los datos se guardan en el teléfono. Antes de cambiar de teléfono, guarda una copia en «Ajustes».</p>`
},
pt: {
  sub: 'Programa de supino', cyc_sub: 'Ciclo {n} · 1RM {rm} kg', kg: 'kg', rm: '1RM',
  nav_today: 'Hoje', nav_plan: 'Plano', nav_progress: 'Progresso', nav_settings: 'Definições',
  start: 'Vamos começar 💪', new_cycle: 'Novo ciclo', rm_label: 'O seu 1RM no supino, kg',
  rm_hint: 'O 1RM é a carga máxima que consegue levantar uma vez. Se não souber exatamente, faça uma estimativa honesta — o programa ajusta-a com os testes das semanas 3, 6 e 9.',
  calc: 'Calcular ciclo de 10 semanas', preview: 'Pré-visualização do ciclo', preview_bad: 'Introduza um 1RM entre 20 e 400 kg',
  preview_note: 'As percentagens são do 1RM nessa fase do ciclo. A partir da semana 4 as cargas são ajustadas pelos testes.',
  wk: 'Sem. {n}', title: 'Semana {w} · treino {d}', rest: 'Descanso', rest_day: 'Descanso 😌',
  work_sets: 'Séries de trabalho', warmup: 'Aquecimento', work: 'Trabalho',
  deload: 'Descarga: com calma, foco na técnica.', prelim: 'Carga provisória: introduza o resultado do teste e o programa ajusta-a.',
  test_n: 'Teste: subir até ao {n}RM', approx: 'kg × {n} — referência', spot: 'Com ajudante!!!',
  test_tip: 'Aquecimento em escada com poucas repetições, depois 2–4 tentativas com 3–5 minutos de descanso. Escolha a carga conforme se sentir.',
  best: 'Melhor carga para {n} rep., kg', test_max: 'Teste: carga × máximo de repetições', kg_max: 'kg × máximo',
  max_tip: 'Mínimo {min}, objetivo — {top}! Quanto mais perto de {top}, mais as cargas vão subir depois.',
  reps_q: 'Quantas repetições fez?', recalc_wait: 'Depois de introduzir, as semanas seguintes são recalculadas.',
  recalc_done: '1RM estimado: {v} kg — semanas seguintes recalculadas.',
  done: 'Treino feito', undo: '✓ Feito — anular', note: 'Nota', note_ph: 'como correu, como se sentiu…',
  cycle: 'Ciclo {n}', go_n: 'Subir até {n}RM', test: 'teste', result: 'resultado {v} kg', x_reps: '× {v} rep.', x_max: '× máx ({min}–{top})',
  fin: 'Ciclo concluído 🎉', summary: 'Resumo', next_rm: 'kg — 1RM para o novo ciclo', fin_line: 'Início do ciclo: {a} kg{t} · estimado: {c} kg', t1: ' · teste 1RM: {v} kg',
  progress: 'Progresso', nodata: 'Ainda sem dados', rm_kg: '1RM, kg', p_start: 'início', p_w: 's', cyc_line: 'Início {rm} kg · treinos {d}/19',
  settings: 'Definições', gym: 'Barra e anilhas do seu ginásio', bar: 'Peso da barra, kg',
  plates_hint: 'Marque as anilhas que existem no ginásio — as cargas serão arredondadas para poderem ser montadas:',
  cur_cycle: 'Ciclo atual', rm_start: '1RM no início do ciclo, kg', new_btn: 'Começar um novo ciclo',
  backup: 'Cópia de segurança', backup_hint: 'Os dados ficam apenas neste telemóvel. Guarde uma cópia para os passar para outro aparelho.',
  save_copy: 'Guardar cópia', load_copy: 'Carregar cópia', bad_file: 'Não foi possível ler o ficheiro',
  language: 'Idioma', per_side: 'por lado:', empty_bar: 'barra vazia', plus30: '+30 s', stop: 'Parar',
  menu: 'Menu', about: 'Sobre o programa', howto: 'Como usar', close: 'Fechar', version: 'Bench Force · versão de teste 0.3',
  about_html: `<p><b>Bench Force</b> é um programa de 10 semanas para ganhar força no supino, usado pelo treinador Serhii com os seus clientes.</p>
<p><b>2 treinos de supino por semana.</b> O primeiro é pesado: poucas repetições (3, 2, 1) com 80–93 % do 1RM. O segundo é de volume: 5–10 repetições com 54–78 %.</p>
<p><b>Testes nas semanas 3, 6 e 9.</b> No primeiro treino sobe até ao 3RM, 2RM e 1RM. No segundo — «carga × máximo de repetições»: o número mostra quanto ficou mais forte e o programa recalcula as semanas seguintes.</p>
<p><b>A semana 10 é de descarga</b>, seguida de um novo ciclo com novo 1RM.</p>
<p>O programa acompanha-o de ciclo em ciclo: as cargas correspondem sempre à sua força atual.</p>`,
  howto_html: `<p><b>1. Início.</b> Introduza o 1RM e marque a barra e as anilhas do ginásio — as cargas serão arredondadas para poderem ser montadas. Toque em «Calcular ciclo».</p>
<p><b>2. «Hoje».</b> O seu próximo treino: aquecimento em escada e séries de trabalho. Por baixo de cada carga vê que anilhas pôr de cada lado.</p>
<p><b>3. Séries e descanso.</b> Marque cada série de trabalho — inicia-se um temporizador de descanso (2–3 minutos). Pode juntar 30 segundos ou pará-lo.</p>
<p><b>4. Testes.</b> Ao subir até ao 3RM, 2RM ou 1RM trabalhe sempre com ajudante e registe a melhor carga. Em «carga × máximo» faça o máximo de repetições possível (mínimo e objetivo indicados) e introduza-as — as semanas seguintes são recalculadas.</p>
<p><b>5. «Treino feito».</b> Toque no fim do treino — abre-se o seguinte. Também pode abrir qualquer treino no «Plano».</p>
<p><b>6. Fim do ciclo.</b> O programa sugere um 1RM para o novo ciclo. Histórico e gráfico em «Progresso».</p>
<p><b>Importante:</b> os dados ficam no telemóvel. Antes de mudar de telemóvel, guarde uma cópia nas «Definições».</p>`
},
zh: {
  sub: '卧推训练计划', cyc_sub: '第 {n} 周期 · 1RM {rm} 公斤', kg: '公斤', rm: '1RM',
  nav_today: '今天', nav_plan: '计划', nav_progress: '进度', nav_settings: '设置',
  start: '开始吧 💪', new_cycle: '新周期', rm_label: '你的卧推 1RM（公斤）',
  rm_hint: '1RM 是你能推起一次的最大重量。如果不确定，请如实估计——程序会根据第 3、6、9 周的测试进行修正。',
  calc: '生成 10 周训练周期', preview: '周期预览', preview_bad: '请输入 20–400 公斤之间的 1RM',
  preview_note: '百分比按该阶段的 1RM 计算。从第 4 周起，重量会根据测试结果调整。',
  wk: '第{n}周', title: '第 {w} 周 · 第 {d} 次训练', rest: '休息', rest_day: '休息日 😌',
  work_sets: '正式组', warmup: '热身', work: '正式训练',
  deload: '减量周：放松，注意动作技术。', prelim: '暂定重量：输入测试结果后程序会修正。',
  test_n: '测试：冲击 {n}RM', approx: '公斤 × {n} — 参考', spot: '务必有人保护！！！',
  test_tip: '先以少量次数阶梯式热身，然后尝试 2–4 次，每次休息 3–5 分钟。根据状态选择重量。',
  best: '{n} 次的最好成绩（公斤）', test_max: '测试：重量 × 最多次数', kg_max: '公斤 × 最多次数',
  max_tip: '最少 {min} 次，目标 {top} 次！越接近 {top}，之后的重量增长越多。',
  reps_q: '你做了几次？', recalc_wait: '输入后程序会重新计算之后几周。',
  recalc_done: '估算 1RM：{v} 公斤 — 之后几周已重新计算。',
  done: '完成训练', undo: '✓ 已完成 — 撤销', note: '备注', note_ph: '训练感受、状态…',
  cycle: '第 {n} 周期', go_n: '冲击 {n}RM', test: '测试', result: '成绩 {v} 公斤', x_reps: '× {v} 次', x_max: '× 最多 ({min}–{top})',
  fin: '周期完成 🎉', summary: '总结', next_rm: '公斤 — 新周期的 1RM', fin_line: '周期起点：{a} 公斤{t} · 估算：{c} 公斤', t1: ' · 1RM 测试：{v} 公斤',
  progress: '进度', nodata: '暂无数据', rm_kg: '1RM（公斤）', p_start: '起点', p_w: '周', cyc_line: '起点 {rm} 公斤 · 训练 {d}/19',
  settings: '设置', gym: '你所在健身房的杠铃和杠铃片', bar: '杠铃杆重量（公斤）',
  plates_hint: '勾选健身房有的杠铃片——重量会取整为能实际组合出的数值：',
  cur_cycle: '当前周期', rm_start: '周期开始时的 1RM（公斤）', new_btn: '开始新周期',
  backup: '备份', backup_hint: '数据只保存在这部手机上。保存一份备份，才能转移到其他设备。',
  save_copy: '保存备份', load_copy: '导入备份', bad_file: '无法读取文件',
  language: '语言', per_side: '每侧：', empty_bar: '空杆', plus30: '+30 秒', stop: '停止',
  menu: '菜单', about: '关于本计划', howto: '使用说明', close: '关闭', version: 'Bench Force · 试用版 0.3',
  about_html: `<p><b>Bench Force</b> 是一个为期 10 周的卧推力量计划，教练 Serhii 用它来训练自己的学员。</p>
<p><b>每周 2 次卧推训练。</b>第一次是大重量：80–93% 1RM 做少量次数（3、2、1）。第二次是容量训练：54–78% 做 5–10 次。</p>
<p><b>第 3、6、9 周进行测试。</b>第一次训练冲击 3RM、2RM 和 1RM；第二次是“重量 × 最多次数”：次数反映你的进步，程序据此重新计算之后几周的重量。</p>
<p><b>第 10 周为减量周</b>，之后以新的 1RM 开始新周期。</p>
<p>程序会一个周期接一个周期地带着你练，重量始终与当前力量相匹配。</p>`,
  howto_html: `<p><b>1. 开始。</b>输入 1RM，勾选健身房的杠铃杆和杠铃片——重量会取整为能组合出的数值。点击“生成周期”。</p>
<p><b>2. “今天”。</b>显示下一次训练：阶梯式热身和正式组。每个重量下方会提示每侧挂哪些杠铃片。</p>
<p><b>3. 组与休息。</b>每完成一个正式组就打勾——会启动休息计时（2–3 分钟），可以加 30 秒或停止。</p>
<p><b>4. 测试。</b>冲击 3RM、2RM、1RM 时务必有人保护，并记录最好成绩。“重量 × 最多次数”尽量多做（会显示最少次数和目标），输入后之后几周会重新计算。</p>
<p><b>5. “完成训练”。</b>训练后点击，会打开下一次训练。也可以从“计划”打开任意一次训练。</p>
<p><b>6. 周期结束。</b>程序会建议新周期的 1RM。历史记录和图表在“进度”中。</p>
<p><b>注意：</b>数据保存在手机上。更换手机前，请在“设置”中保存备份。</p>`
}
};
// --- тесты «вес × максимум»: динамический пересчёт ---
const I18N_X = {
ru:{tests:'Тесты на максимум повторений',tests_hint:'Введите, сколько повторений получилось в тестовом подходе, — веса следующих недель пересчитаются сразу.',aff:'→ недели {a}–{b}',aff9:'→ неделя 10 и новый цикл',est_rm:'расчётный 1ПМ: {v} кг',not_entered:'пока не введено — считаем по {n} повт.',new_w:'Новые веса:',reps_ph:'повт.'},
uk:{tests:'Тести на максимум повторень',tests_hint:'Введіть, скільки повторень вийшло в тестовому підході, — ваги наступних тижнів перерахуються одразу.',aff:'→ тижні {a}–{b}',aff9:'→ тиждень 10 і новий цикл',est_rm:'розрахунковий 1ПМ: {v} кг',not_entered:'ще не введено — рахуємо за {n} повт.',new_w:'Нові ваги:',reps_ph:'повт.'},
en:{tests:'Max-rep tests',tests_hint:'Enter how many reps you did in the test set — the following weeks are recalculated immediately.',aff:'→ weeks {a}–{b}',aff9:'→ week 10 and next cycle',est_rm:'estimated 1RM: {v} kg',not_entered:'not entered yet — using {n} reps',new_w:'New weights:',reps_ph:'reps'},
fr:{tests:'Tests max de répétitions',tests_hint:'Entrez le nombre de répétitions du test — les semaines suivantes sont recalculées aussitôt.',aff:'→ semaines {a}–{b}',aff9:'→ semaine 10 et nouveau cycle',est_rm:'1RM estimé : {v} kg',not_entered:'pas encore saisi — calcul avec {n} rép.',new_w:'Nouvelles charges :',reps_ph:'rép.'},
de:{tests:'Tests auf max. Wiederholungen',tests_hint:'Trage ein, wie viele Wiederholungen du im Testsatz geschafft hast — die nächsten Wochen werden sofort neu berechnet.',aff:'→ Wochen {a}–{b}',aff9:'→ Woche 10 und neuer Zyklus',est_rm:'geschätztes 1RM: {v} kg',not_entered:'noch nicht eingetragen — gerechnet mit {n} Wdh.',new_w:'Neue Gewichte:',reps_ph:'Wdh.'},
es:{tests:'Tests de máximo de repeticiones',tests_hint:'Introduce cuántas repeticiones hiciste en la serie de test: las semanas siguientes se recalculan al instante.',aff:'→ semanas {a}–{b}',aff9:'→ semana 10 y nuevo ciclo',est_rm:'1RM estimado: {v} kg',not_entered:'aún sin introducir — se calcula con {n} rep.',new_w:'Nuevos pesos:',reps_ph:'rep.'},
pt:{tests:'Testes de máximo de repetições',tests_hint:'Introduza quantas repetições fez na série de teste — as semanas seguintes são recalculadas de imediato.',aff:'→ semanas {a}–{b}',aff9:'→ semana 10 e novo ciclo',est_rm:'1RM estimado: {v} kg',not_entered:'ainda não introduzido — calculado com {n} rep.',new_w:'Novas cargas:',reps_ph:'rep.'},
zh:{tests:'最多次数测试',tests_hint:'输入测试组完成的次数——之后几周的重量会立即重新计算。',aff:'→ 第 {a}–{b} 周',aff9:'→ 第 10 周和新周期',est_rm:'估算 1RM：{v} 公斤',not_entered:'尚未输入——暂按 {n} 次计算',new_w:'新重量：',reps_ph:'次'}
};
for (const k in I18N_X) Object.assign(I18N[k], I18N_X[k]);
