export type LangCode = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ko' | 'ar' | 'pt' | 'ru';

export interface Language {
  code: LangCode;
  label: string;      // native name
  english: string;    // English name
  flag: string;
  rtl?: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English',    english: 'English',    flag: '🇬🇧' },
  { code: 'es', label: 'Español',    english: 'Spanish',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   english: 'French',     flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    english: 'German',     flag: '🇩🇪' },
  { code: 'ja', label: '日本語',      english: 'Japanese',   flag: '🇯🇵' },
  { code: 'zh', label: '中文',        english: 'Chinese',    flag: '🇨🇳' },
  { code: 'ko', label: '한국어',      english: 'Korean',     flag: '🇰🇷' },
  { code: 'ar', label: 'العربية',    english: 'Arabic',     flag: '🇸🇦', rtl: true },
  { code: 'pt', label: 'Português',  english: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru', label: 'Русский',    english: 'Russian',    flag: '🇷🇺' },
];

export type TranslationKeys = {
  // Nav
  home: string; create: string; decks: string; social: string; profile: string; signOut: string;
  // Dashboard
  hey: string; yourDecks: string; newDeck: string; noDecksYet: string; createFirst: string;
  study: string; cards: string; xpToLevel: string;
  // Create
  createFlashcards: string; deckTitle: string; deckTitlePlaceholder: string;
  numCards: string; generateBtn: string; generating: string; visibility: string;
  publicLabel: string; privateLabel: string; publicDesc: string; privateDesc: string;
  // Study
  easy: string; good: string; hard: string; flipHint: string;
  // Auth
  signIn: string; signUp: string; emailLabel: string; passwordLabel: string; welcomeBack: string;
  // Common
  save: string; back: string; next: string; skip: string; loading: string; delete: string; share: string;
  // Completion
  deckCreated: string; cardsGenerated: string; createAnother: string;
};

const T: Record<LangCode, TranslationKeys> = {
  en: {
    home: 'Home', create: 'Create', decks: 'Decks', social: 'Social', profile: 'Profile', signOut: 'Sign out',
    hey: 'Hey', yourDecks: 'Your Decks', newDeck: 'New Deck', noDecksYet: 'No decks yet.', createFirst: 'Create your first one!',
    study: 'Study', cards: 'cards', xpToLevel: 'XP to level',
    createFlashcards: 'Create Flashcards', deckTitle: 'Deck Title', deckTitlePlaceholder: 'e.g. Biology Chapter 3',
    numCards: 'Number of Cards', generateBtn: '⚡ Generate Flashcards', generating: 'Generating with AI...',
    visibility: 'Visibility', publicLabel: 'Public', privateLabel: 'Private',
    publicDesc: 'Visible in the social feed', privateDesc: 'Only accessible via share link',
    easy: 'Easy', good: 'Good', hard: 'Hard', flipHint: 'Tap to flip',
    signIn: 'Sign In', signUp: 'Sign Up', emailLabel: 'Email', passwordLabel: 'Password', welcomeBack: 'Welcome back',
    save: 'Save', back: 'Back', next: 'Next', skip: 'Skip', loading: 'Loading...', delete: 'Delete', share: 'Share',
    deckCreated: 'Deck Created!', cardsGenerated: 'cards saved to', createAnother: 'Create Another',
  },
  es: {
    home: 'Inicio', create: 'Crear', decks: 'Mazos', social: 'Social', profile: 'Perfil', signOut: 'Cerrar sesión',
    hey: 'Hola', yourDecks: 'Tus Mazos', newDeck: 'Nuevo Mazo', noDecksYet: 'Aún no hay mazos.', createFirst: '¡Crea el primero!',
    study: 'Estudiar', cards: 'tarjetas', xpToLevel: 'XP para nivel',
    createFlashcards: 'Crear Tarjetas', deckTitle: 'Nombre del Mazo', deckTitlePlaceholder: 'ej. Biología Capítulo 3',
    numCards: 'Número de Tarjetas', generateBtn: '⚡ Generar Tarjetas', generating: 'Generando con IA...',
    visibility: 'Visibilidad', publicLabel: 'Público', privateLabel: 'Privado',
    publicDesc: 'Visible en el feed social', privateDesc: 'Solo accesible por enlace',
    easy: 'Fácil', good: 'Bien', hard: 'Difícil', flipHint: 'Toca para voltear',
    signIn: 'Iniciar sesión', signUp: 'Registrarse', emailLabel: 'Correo', passwordLabel: 'Contraseña', welcomeBack: 'Bienvenido de nuevo',
    save: 'Guardar', back: 'Atrás', next: 'Siguiente', skip: 'Saltar', loading: 'Cargando...', delete: 'Eliminar', share: 'Compartir',
    deckCreated: '¡Mazo Creado!', cardsGenerated: 'tarjetas guardadas en', createAnother: 'Crear Otro',
  },
  fr: {
    home: 'Accueil', create: 'Créer', decks: 'Paquets', social: 'Social', profile: 'Profil', signOut: 'Déconnexion',
    hey: 'Salut', yourDecks: 'Vos Paquets', newDeck: 'Nouveau Paquet', noDecksYet: 'Pas encore de paquets.', createFirst: 'Créez le premier !',
    study: 'Étudier', cards: 'cartes', xpToLevel: 'XP pour niveau',
    createFlashcards: 'Créer des Fiches', deckTitle: 'Nom du Paquet', deckTitlePlaceholder: 'ex. Biologie Chapitre 3',
    numCards: 'Nombre de Cartes', generateBtn: '⚡ Générer des Fiches', generating: 'Génération en cours...',
    visibility: 'Visibilité', publicLabel: 'Public', privateLabel: 'Privé',
    publicDesc: 'Visible dans le fil social', privateDesc: 'Accessible uniquement via lien',
    easy: 'Facile', good: 'Bien', hard: 'Difficile', flipHint: 'Appuyer pour retourner',
    signIn: 'Connexion', signUp: "S'inscrire", emailLabel: 'E-mail', passwordLabel: 'Mot de passe', welcomeBack: 'Bon retour',
    save: 'Enregistrer', back: 'Retour', next: 'Suivant', skip: 'Passer', loading: 'Chargement...', delete: 'Supprimer', share: 'Partager',
    deckCreated: 'Paquet Créé !', cardsGenerated: 'cartes enregistrées dans', createAnother: 'Créer un Autre',
  },
  de: {
    home: 'Startseite', create: 'Erstellen', decks: 'Stapel', social: 'Sozial', profile: 'Profil', signOut: 'Abmelden',
    hey: 'Hey', yourDecks: 'Deine Stapel', newDeck: 'Neuer Stapel', noDecksYet: 'Noch keine Stapel.', createFirst: 'Erstelle deinen ersten!',
    study: 'Lernen', cards: 'Karten', xpToLevel: 'XP bis Level',
    createFlashcards: 'Karteikarten erstellen', deckTitle: 'Stapelname', deckTitlePlaceholder: 'z.B. Biologie Kapitel 3',
    numCards: 'Anzahl der Karten', generateBtn: '⚡ Karten generieren', generating: 'KI generiert...',
    visibility: 'Sichtbarkeit', publicLabel: 'Öffentlich', privateLabel: 'Privat',
    publicDesc: 'Im sozialen Feed sichtbar', privateDesc: 'Nur über Link zugänglich',
    easy: 'Leicht', good: 'Gut', hard: 'Schwer', flipHint: 'Tippen zum Umdrehen',
    signIn: 'Anmelden', signUp: 'Registrieren', emailLabel: 'E-Mail', passwordLabel: 'Passwort', welcomeBack: 'Willkommen zurück',
    save: 'Speichern', back: 'Zurück', next: 'Weiter', skip: 'Überspringen', loading: 'Lädt...', delete: 'Löschen', share: 'Teilen',
    deckCreated: 'Stapel erstellt!', cardsGenerated: 'Karten gespeichert in', createAnother: 'Weiteren erstellen',
  },
  ja: {
    home: 'ホーム', create: '作成', decks: 'デッキ', social: 'ソーシャル', profile: 'プロフィール', signOut: 'ログアウト',
    hey: 'こんにちは', yourDecks: 'あなたのデッキ', newDeck: '新しいデッキ', noDecksYet: 'まだデッキがありません。', createFirst: '最初のデッキを作りましょう！',
    study: '学習', cards: 'カード', xpToLevel: 'XP でレベルアップ',
    createFlashcards: 'フラッシュカード作成', deckTitle: 'デッキ名', deckTitlePlaceholder: '例: 生物学 第3章',
    numCards: 'カード枚数', generateBtn: '⚡ カードを生成', generating: 'AIで生成中...',
    visibility: '公開設定', publicLabel: '公開', privateLabel: '非公開',
    publicDesc: 'ソーシャルフィードに表示', privateDesc: 'リンクでのみアクセス可',
    easy: '簡単', good: '普通', hard: '難しい', flipHint: 'タップして裏返す',
    signIn: 'ログイン', signUp: '登録', emailLabel: 'メール', passwordLabel: 'パスワード', welcomeBack: 'おかえりなさい',
    save: '保存', back: '戻る', next: '次へ', skip: 'スキップ', loading: '読み込み中...', delete: '削除', share: '共有',
    deckCreated: 'デッキ作成完了！', cardsGenerated: 'カードを保存しました:', createAnother: '別のデッキを作成',
  },
  zh: {
    home: '首页', create: '创建', decks: '卡组', social: '社交', profile: '个人', signOut: '退出登录',
    hey: '嗨', yourDecks: '我的卡组', newDeck: '新建卡组', noDecksYet: '还没有卡组。', createFirst: '创建第一个吧！',
    study: '学习', cards: '张卡片', xpToLevel: 'XP 升级',
    createFlashcards: '创建闪卡', deckTitle: '卡组名称', deckTitlePlaceholder: '例：生物学第3章',
    numCards: '卡片数量', generateBtn: '⚡ AI 生成卡片', generating: 'AI 生成中...',
    visibility: '可见性', publicLabel: '公开', privateLabel: '私密',
    publicDesc: '在社交动态中可见', privateDesc: '仅通过链接访问',
    easy: '简单', good: '一般', hard: '困难', flipHint: '点击翻转',
    signIn: '登录', signUp: '注册', emailLabel: '邮箱', passwordLabel: '密码', welcomeBack: '欢迎回来',
    save: '保存', back: '返回', next: '下一步', skip: '跳过', loading: '加载中...', delete: '删除', share: '分享',
    deckCreated: '卡组已创建！', cardsGenerated: '张卡片已保存至', createAnother: '再创建一个',
  },
  ko: {
    home: '홈', create: '만들기', decks: '덱', social: '소셜', profile: '프로필', signOut: '로그아웃',
    hey: '안녕하세요', yourDecks: '내 덱', newDeck: '새 덱', noDecksYet: '아직 덱이 없습니다.', createFirst: '첫 번째 덱을 만들어보세요!',
    study: '학습', cards: '카드', xpToLevel: 'XP 레벨업',
    createFlashcards: '플래시카드 만들기', deckTitle: '덱 이름', deckTitlePlaceholder: '예: 생물학 3장',
    numCards: '카드 수', generateBtn: '⚡ 카드 생성하기', generating: 'AI로 생성 중...',
    visibility: '공개 설정', publicLabel: '공개', privateLabel: '비공개',
    publicDesc: '소셜 피드에 표시됨', privateDesc: '링크로만 접근 가능',
    easy: '쉬움', good: '보통', hard: '어려움', flipHint: '탭하여 뒤집기',
    signIn: '로그인', signUp: '회원가입', emailLabel: '이메일', passwordLabel: '비밀번호', welcomeBack: '다시 오신 것을 환영합니다',
    save: '저장', back: '뒤로', next: '다음', skip: '건너뛰기', loading: '로딩 중...', delete: '삭제', share: '공유',
    deckCreated: '덱이 생성되었습니다!', cardsGenerated: '카드가 저장되었습니다:', createAnother: '다른 덱 만들기',
  },
  ar: {
    home: 'الرئيسية', create: 'إنشاء', decks: 'الحزم', social: 'اجتماعي', profile: 'الملف', signOut: 'تسجيل الخروج',
    hey: 'مرحباً', yourDecks: 'حزمك', newDeck: 'حزمة جديدة', noDecksYet: 'لا توجد حزم بعد.', createFirst: 'أنشئ أولها!',
    study: 'دراسة', cards: 'بطاقات', xpToLevel: 'XP للمستوى',
    createFlashcards: 'إنشاء بطاقات', deckTitle: 'اسم الحزمة', deckTitlePlaceholder: 'مثال: الأحياء الفصل 3',
    numCards: 'عدد البطاقات', generateBtn: '⚡ توليد البطاقات', generating: 'جاري التوليد بالذكاء الاصطناعي...',
    visibility: 'الظهور', publicLabel: 'عام', privateLabel: 'خاص',
    publicDesc: 'مرئي في الخلاصة الاجتماعية', privateDesc: 'متاح فقط عبر الرابط',
    easy: 'سهل', good: 'جيد', hard: 'صعب', flipHint: 'اضغط للقلب',
    signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب', emailLabel: 'البريد الإلكتروني', passwordLabel: 'كلمة المرور', welcomeBack: 'مرحباً بعودتك',
    save: 'حفظ', back: 'رجوع', next: 'التالي', skip: 'تخطي', loading: 'جار التحميل...', delete: 'حذف', share: 'مشاركة',
    deckCreated: 'تم إنشاء الحزمة!', cardsGenerated: 'بطاقات محفوظة في', createAnother: 'إنشاء حزمة أخرى',
  },
  pt: {
    home: 'Início', create: 'Criar', decks: 'Baralhos', social: 'Social', profile: 'Perfil', signOut: 'Sair',
    hey: 'Olá', yourDecks: 'Seus Baralhos', newDeck: 'Novo Baralho', noDecksYet: 'Nenhum baralho ainda.', createFirst: 'Crie o primeiro!',
    study: 'Estudar', cards: 'cartões', xpToLevel: 'XP para nível',
    createFlashcards: 'Criar Flashcards', deckTitle: 'Nome do Baralho', deckTitlePlaceholder: 'ex. Biologia Capítulo 3',
    numCards: 'Número de Cartões', generateBtn: '⚡ Gerar Flashcards', generating: 'Gerando com IA...',
    visibility: 'Visibilidade', publicLabel: 'Público', privateLabel: 'Privado',
    publicDesc: 'Visível no feed social', privateDesc: 'Acessível apenas por link',
    easy: 'Fácil', good: 'Bom', hard: 'Difícil', flipHint: 'Toque para virar',
    signIn: 'Entrar', signUp: 'Cadastrar', emailLabel: 'E-mail', passwordLabel: 'Senha', welcomeBack: 'Bem-vindo de volta',
    save: 'Salvar', back: 'Voltar', next: 'Próximo', skip: 'Pular', loading: 'Carregando...', delete: 'Excluir', share: 'Compartilhar',
    deckCreated: 'Baralho Criado!', cardsGenerated: 'cartões salvos em', createAnother: 'Criar Outro',
  },
  ru: {
    home: 'Главная', create: 'Создать', decks: 'Колоды', social: 'Соцсеть', profile: 'Профиль', signOut: 'Выйти',
    hey: 'Привет', yourDecks: 'Ваши Колоды', newDeck: 'Новая Колода', noDecksYet: 'Колод пока нет.', createFirst: 'Создайте первую!',
    study: 'Учить', cards: 'карточек', xpToLevel: 'XP до уровня',
    createFlashcards: 'Создать Карточки', deckTitle: 'Название Колоды', deckTitlePlaceholder: 'напр. Биология Глава 3',
    numCards: 'Количество Карточек', generateBtn: '⚡ Создать Карточки', generating: 'Генерация с ИИ...',
    visibility: 'Видимость', publicLabel: 'Публичная', privateLabel: 'Приватная',
    publicDesc: 'Видна в социальной ленте', privateDesc: 'Доступна только по ссылке',
    easy: 'Легко', good: 'Хорошо', hard: 'Сложно', flipHint: 'Нажмите, чтобы перевернуть',
    signIn: 'Войти', signUp: 'Зарегистрироваться', emailLabel: 'Эл. почта', passwordLabel: 'Пароль', welcomeBack: 'С возвращением',
    save: 'Сохранить', back: 'Назад', next: 'Далее', skip: 'Пропустить', loading: 'Загрузка...', delete: 'Удалить', share: 'Поделиться',
    deckCreated: 'Колода создана!', cardsGenerated: 'карточек сохранено в', createAnother: 'Создать ещё',
  },
};

export default T;
