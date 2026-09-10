import type {
  AboutCustomSection,
  AboutFacts,
  AboutMissionVision,
  AboutValues,
  WhyChoose,
  AcademicsCurriculum,
  AcademicsLevels,
  AcademicsPrograms,
  EventItem,
  FooterContent,
  HeaderContent,
  HomeCta,
  HomePrograms,
  HomeStats,
  NewsItem,
} from "./types";

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Sample content displayed when Supabase is not configured yet.
 * Once the database is set up, real content replaces this automatically.
 */
export const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "fallback-1",
    title_en: "Welcome to the 2026–2027 Academic Year!",
    title_my: "၂၀၂၆–၂၀၂၇ ပညာသင်နှစ်သစ်မှ ကြိုဆိုပါသည်!",
    body_en:
      "We are delighted to welcome all our students and families back to campus. This year we are introducing new STEAM labs, an expanded library, and more sports programmes. Here's to a year of curiosity, growth and friendship!",
    body_my:
      "ကျောင်းသား ကျောင်းသူများနှင့် မိသားစုများအားလုံးကို ကျောင်းဝင်းသို့ ပြန်လည်ကြိုဆိုပါသည်။ ယခုနှစ်တွင် STEAM ဓာတ်ခွဲခန်းအသစ်များ၊ တိုးချဲ့ထားသော စာကြည့်တိုက်နှင့် အားကစား အစီအစဉ်များ ထပ်မံပြုလုပ်နေပါသည်။ စူးစမ်းလိုစိတ်၊ ကြီးထွားမှုနှင့် ခင်မင်ရင်းနှီးမှုများဖြင့် ပြည့်နှက်သော တစ်နှစ်တာ ဖြစ်ပါစေ!",
    image_url: null,
    published_at: daysFromNow(-3),
    created_at: daysFromNow(-3),
  },
  {
    id: "fallback-2",
    title_en: "Our Students Shine at the National Science Fair",
    title_my: "ကျောင်းသားများ အမျိုးသား သိပ္ပံပြပွဲတွင် ထူးချွန်စွာ ပါဝင်",
    body_en:
      "Congratulations to our Grade 8 robotics team, who won second place at the National Youth Science Fair with their flood-monitoring robot. We are incredibly proud of their creativity and teamwork!",
    body_my:
      "ရေကြီးမှု စောင့်ကြည့်ရေး စက်ရုပ်ဖြင့် အမျိုးသား လူငယ် သိပ္ပံပြပွဲတွင် ဒုတိယဆု ရရှိခဲ့သော ကျွန်ုပ်တို့၏ တန်း ၈ စက်ရုပ် အဖွဲ့အား ဂုဏ်ပြုပါသည်။ ၎င်းတို့၏ တီထွင်ဖန်တီးမှုနှင့် အဖွဲ့လိုက် လုပ်ဆောင်မှုအတွက် အလွန်ဂုဏ်ယူပါသည်!",
    image_url: null,
    published_at: daysFromNow(-10),
    created_at: daysFromNow(-10),
  },
  {
    id: "fallback-3",
    title_en: "Cultural Day 2026 — A Celebration of Our Heritage",
    title_my: "၂၀၂၆ ယဉ်ကျေးမှုနေ့ — ကျွန်ုပ်တို့၏ အမွေအနှစ်များ အခမ်းအနား",
    body_en:
      "Last Friday our campus was filled with colour, music and food as students celebrated Cultural Day. Thank you to the families who shared traditional dress, dishes and performances with our community.",
    body_my:
      "ကျောင်းသားများ ယဉ်ကျေးမှုနေ့ကို ဆင်နွှဲစဉ် ပြီးခဲ့သော သောကြာနေ့က ကျောင်းဝင်းတစ်ခုလုံး အရောင်အသွေး၊ ဂီတနှင့် အစားအစာများဖြင့် ပြည့်နှက်ခဲ့သည်။ ရိုးရာဝတ်စုံများ၊ ဟင်းလျာများနှင့် ဖျော်ဖြေမှုများကို ကျွန်ုပ်တို့၏ အသိုင်းအဝိုင်းနှင့် မျှဝေပေးခဲ့သော မိသားစုများကို ကျေးဇူးတင်ပါသည်။",
    image_url: null,
    published_at: daysFromNow(-20),
    created_at: daysFromNow(-20),
  },
];

export const FALLBACK_EVENTS: EventItem[] = [
  {
    id: "fallback-e1",
    title_en: "Open House & Campus Tour",
    title_my: "ကျောင်းဖွင့်ပွဲနှင့် ကျောင်းဝင်း လေ့လာခြင်း",
    date: daysFromNow(7),
    time: "9:00 AM – 12:00 PM",
    location_en: "Main Campus, Yangon",
    location_my: "အဓိကကျောင်းဝင်း၊ ရန်ကုန်",
    description_en:
      "Prospective families are invited to tour our campus, meet teachers and learn about our programmes.",
    description_my:
      "လျှောက်ထားလိုသော မိသားစုများကို ကျောင်းဝင်း လေ့လာရန်၊ ဆရာများနှင့် တွေ့ဆုံရန်နှင့် ကျွန်ုပ်တို့၏ အစီအစဉ်များအကြောင်း လေ့လာရန် ဖိတ်ခေါ်ပါသည်။",
    image_url: "/Bunner/pamphlet01.jpg",
    created_at: daysFromNow(-1),
  },
  {
    id: "fallback-e2",
    title_en: "Annual Sports Day",
    title_my: "နှစ်ပတ်လည် အားကစားနေ့",
    date: daysFromNow(21),
    time: "8:00 AM – 3:00 PM",
    location_en: "School Sports Ground",
    location_my: "ကျောင်း အားကစားကွင်း",
    description_en:
      "A day of friendly competition, team spirit and fun for all grade levels. Parents are welcome to cheer!",
    description_my:
      "အတန်းအဆင့်အားလုံးအတွက် ခင်မင်ရင်းနှီးသော ပြိုင်ပွဲ၊ အဖွဲ့လိုက် စိတ်ဓာတ်နှင့် ပျော်ရွှင်မှုများဖြင့် ပြည့်နှက်သော နေ့တစ်နေ့။ မိဘများ အားပေးရန် ကြိုဆိုပါသည်!",
    image_url: null,
    created_at: daysFromNow(-1),
  },
  {
    id: "fallback-e3",
    title_en: "Grade 12 Graduation Ceremony",
    title_my: "တန်း ၁၂ ဘွဲ့နှင်းသဘင် အခမ်းအနား",
    date: daysFromNow(45),
    time: "4:00 PM – 6:00 PM",
    location_en: "School Auditorium",
    location_my: "ကျောင်း ခန်းမကြီး",
    description_en:
      "Celebrating the achievements of our graduating class of 2026. Families and friends welcome.",
    description_my:
      "၂၀၂၆ ဘွဲ့ရ အတန်းသားများ၏ အောင်မြင်မှုများကို ဂုဏ်ပြုကျင်းပခြင်း။ မိသားစုများနှင့် သူငယ်ချင်းများကို ကြိုဆိုပါသည်။",
    image_url: null,
    created_at: daysFromNow(-1),
  },
];

export const FALLBACK_GALLERY: { image_url: string; caption_en: string; caption_my: string }[] = [
  { image_url: "", caption_en: "Our classroom", caption_my: "ကျွန်ုပ်တို့၏ စာသင်ခန်း" },
  { image_url: "", caption_en: "Science lab", caption_my: "သိပ္ပံ ဓာတ်ခွဲခန်း" },
  { image_url: "", caption_en: "Sports day", caption_my: "အားကစားနေ့" },
  { image_url: "", caption_en: "School library", caption_my: "စာကြည့်တိုက်" },
  { image_url: "", caption_en: "Art class", caption_my: "ပန်းချီ အတန်း" },
  { image_url: "", caption_en: "Cultural day", caption_my: "ယဉ်ကျေးမှုနေ့" },
];

export const FALLBACK_SITE_CONTENT: Record<string, { en: string; my: string }> = {
  home_hero_badge: {
    en: "Hope International School",
    my: "Hope အပြည်ပြည်ဆိုင်ရာ ကျောင်း",
  },
  home_hero_title: {
    en: "Nurturing Global Citizens, One Student at a Time",
    my: "ကမ္ဘာ့နိုင်ငံသားကောင်းများကို ပြုစုပျိုးထောင်ခြင်း",
  },
  home_hero_subtitle: {
    en: "A world-class international education in Myanmar — from Early Years to High School, where students learn in English and Burmese, grow in confidence, and become caring leaders of tomorrow.",
    my: "မြန်မာနိုင်ငံရှိ ကမ္ဘာ့အဆင့်မီ နိုင်ငံတကာပညာရေး — မူကြိုမှ အထက်တန်းအထိ၊ အင်္ဂလိပ်နှင့် မြန်မာဘာသာ နှစ်မျိုးလုံးဖြင့် သင်ယူပြီး ယုံကြည်မှု တည်ဆောက်ကာ နောင်တွင် ကြင်နာတတ်သော ခေါင်းဆောင်များ ဖြစ်လာစေရန် ပြုစုပေးပါသည်။",
  },
  home_welcome_title: {
    en: "Welcome to Our School",
    my: "ကျောင်းမှ ကြိုဆိုပါသည်",
  },
  home_welcome_text: {
    en: "At Hope International School, we believe every child is unique. Our caring teachers, modern facilities and a balanced international curriculum help each student discover their strengths, think critically and act with kindness. We are proud to bring together the best of international education and Myanmar culture — so our students are ready for the world, wherever it takes them.",
    my: "Hope အပြည်ပြည်ဆိုင်ရာကျောင်းတွင် ကလေးတိုင်းသည် ထူးခြားသည်ဟု ကျွန်ုပ်တို့ ယုံကြည်ပါသည်။ ဂရုစိုက်တတ်သော ဆရာ ဆရာမများ၊ ခေတ်မီသော သင်ကြားရေးအဆောက်အအုံများနှင့် မျှတသော နိုင်ငံတကာ သင်ရိုးညွှန်းတမ်းသည် ကျောင်းသားတိုင်း မိမိ၏ အရည်အချင်းများကို ရှာဖွေတွေ့ရှိနိုင်ရန်၊ ဝေဖန်ပိုင်းခြား တွေးခေါ်နိုင်ရန်နှင့် ကြင်နာမှုဖြင့် ပြုမူတတ်ရန် ကူညီပေးပါသည်။",
  },
  about_intro: {
    en: "Hope International School is a vibrant learning community in Myanmar where international standards meet local values. Since our founding, we have grown into a school of over 500 students from Early Years to Grade 12, guided by a passionate team of local and international educators.",
    my: "Hope အပြည်ပြည်ဆိုင်ရာကျောင်းသည် နိုင်ငံတကာ စံနှုန်းများနှင့် ဒေသဆိုင်ရာ တန်ဖိုးများ ပေါင်းစပ်ထားသော မြန်မာနိုင်ငံရှိ တက်ကြွသော သင်ယူမှု အသိုင်းအဝိုင်းတစ်ခုဖြစ်သည်။ စတင်တည်ထောင်ကတည်းက မူကြိုမှ တန်း ၁၂ အထိ ကျောင်းသား ၅၀၀ ကျော်ရှိသော ကျောင်းအဖြစ် ကြီးထွားလာခဲ့ပြီး ဒေသခံနှင့် နိုင်ငံတကာ ပညာရေးဆရာများ၏ စိတ်အားထက်သန်သော အဖွဲ့က လမ်းညွှန်ပေးလျက်ရှိသည်။",
  },
  academics_intro: {
    en: "Our curriculum blends international teaching standards with the best of Myanmar culture. Students learn to think deeply, ask questions and apply their knowledge to real life.",
    my: "ကျွန်ုပ်တို့၏ သင်ရိုးညွှန်းတမ်းသည် နိုင်ငံတကာ သင်ကြားရေး စံနှုန်းများနှင့် မြန်မာ့ယဉ်ကျေးမှု၏ အကောင်းဆုံးအရာများကို ပေါင်းစပ်ထားသည်။ ကျောင်းသားများသည် နက်နက်ရှိုင်းရှိုင်း တွေးခေါ်တတ်ရန်၊ မေးခွန်းထုတ်တတ်ရန်နှင့် မိမိတို့၏ အသိပညာကို လက်တွေ့ဘဝတွင် အသုံးချတတ်ရန် သင်ယူကြသည်။",
  },
};

/** Defaults for the header, edited from the admin portal (Header tab). */
export const FALLBACK_HEADER: HeaderContent = {
  logo_url: "/Logo.jpg",
  links: [
    { href: "/", label_en: "Home", label_my: "မူလစာမျက်နှာ" },
    { href: "/about", label_en: "About Us", label_my: "ကျောင်းအကြောင်း" },
    { href: "/academics", label_en: "Academics", label_my: "ပညာရေး" },
    { href: "/news", label_en: "News & Events", label_my: "သတင်းနှင့် ပွဲများ" },
    { href: "/gallery", label_en: "Gallery", label_my: "ဓာတ်ပုံပြခန်း" },
    { href: "/downloads", label_en: "Downloads", label_my: "ဒေါင်းလုဒ်များ" },
  ],
};

/** Defaults for the footer, edited from the admin portal (Footer tab). */
export const FALLBACK_FOOTER: FooterContent = {
  tagline_en:
    "Nurturing global citizens — an international education in the heart of Myanmar.",
  tagline_my:
    "ကမ္ဘာ့နိုင်ငံသားကောင်းများ ပြုစုပျိုးထောင်ခြင်း — မြန်မာနိုင်ငံ၏ ဗဟိုတွင် နိုင်ငံတကာ ပညာရေး။",
  address_en:
    "No. 123, University Avenue Road, Kamayut Township, Yangon, Myanmar",
  address_my: "တက္ကသိုလ်ရိပ်သာလမ်း ၁၂၃၊ ကမာရွတ်မြို့နယ်၊ ရန်ကုန်မြို့၊ မြန်မာ",
  phone_en: "+95 9 123 456 789",
  phone_my: "+95 9 123 456 789",
  email_en: "info@hopeinternationalschool.com",
  email_my: "info@hopeinternationalschool.com",
  hours_en: "Mon – Fri: 8:00 AM – 4:30 PM",
  hours_my: "တနင်္လာ – သောကြာ: နံနက် ၈:၀၀ – ညနေ ၄:၃၀",
  links: [
    { href: "/", label_en: "Home", label_my: "မူလစာမျက်နှာ" },
    { href: "/about", label_en: "About Us", label_my: "ကျောင်းအကြောင်း" },
    { href: "/academics", label_en: "Academics", label_my: "ပညာရေး" },
    { href: "/admissions", label_en: "Admissions", label_my: "ဝင်ခွင့်" },
    { href: "/news", label_en: "News & Events", label_my: "သတင်းနှင့် ပွဲများ" },
    { href: "/gallery", label_en: "Gallery", label_my: "ဓာတ်ပုံပြခန်း" },
    { href: "/downloads", label_en: "Downloads", label_my: "ဒေါင်းလုဒ်များ" },
  ],
};

/** Defaults for the Home page sections, edited from the admin portal. */
export const FALLBACK_HOME_STATS: HomeStats = {
  stats: [
    { number_en: "500+", number_my: "၅၀၀+", label_en: "Students", label_my: "ကျောင်းသား ကျောင်းသူများ" },
    { number_en: "40+", number_my: "၄၀+", label_en: "Qualified Teachers", label_my: "အရည်အချင်းပြည့်မီ ဆရာ ဆရာမများ" },
    { number_en: "12", number_my: "၁၂", label_en: "Years of Excellence", label_my: "နှစ်ပေါင်း အတွေ့အကြုံ" },
    { number_en: "1:15", number_my: "၁:၁၅", label_en: "Teacher–Student Ratio", label_my: "ဆရာ–ကျောင်းသား အချိုး" },
  ],
};

export const FALLBACK_HOME_PROGRAMS: HomePrograms = {
  title_en: "Our Programs",
  title_my: "ကျွန်ုပ်တို့၏ သင်တန်းအစီအစဉ်များ",
  subtitle_en: "A complete learning journey from age 2 to 18, built around international standards.",
  subtitle_my:
    "အသက် ၂ နှစ်မှ ၁၈ နှစ်အထိ နိုင်ငံတကာ စံနှုန်းများအပေါ် အခြေခံထားသော ပြီးပြည့်စုံသည့် သင်ယူမှုခရီး။",
  programs: [
    {
      title_en: "Early Years",
      title_my: "မူကြိုပညာရေး",
      desc_en: "A warm, play-based start for ages 2–5 that builds curiosity, confidence and early language skills.",
      desc_my:
        "အသက် ၂–၅ နှစ်များအတွက် ပျော်ရွှင်ဖွယ် ကစားနည်းအခြေပြု စတင်မှု — စူးစမ်းလိုစိတ်၊ ယုံကြည်မှုနှင့် ဘာသာစကား ကျွမ်းကျင်မှုတို့ကို တည်ဆောက်ပေးသည်။",
    },
    {
      title_en: "Primary School",
      title_my: "မူလတန်း",
      desc_en: "Grades 1–5 with a strong foundation in literacy, numeracy, science and creative thinking.",
      desc_my:
        "တန်း ၁–၅ — စာဖတ်၊ စာရေး၊ သင်္ချာ၊ သိပ္ပံနှင့် တီထွင်ဖန်တီးမှု တွေးခေါ်ခြင်းတို့တွင် ခိုင်မာသော အခြေခံအုတ်မြစ်။",
    },
    {
      title_en: "Middle School",
      title_my: "အလယ်တန်း",
      desc_en: "Grades 6–8 that deepen knowledge, develop study skills and encourage independent learning.",
      desc_my:
        "တန်း ၆–၈ — အသိပညာ နက်ရှိုင်းစေပြီး လေ့လာမှုစွမ်းရည်နှင့် ကိုယ်တိုင်သင်ယူတတ်သည့် အလေ့အကျင့်ကို အားပေးသည်။",
    },
    {
      title_en: "High School",
      title_my: "အထက်တန်း",
      desc_en: "Grades 9–12 preparing students for international exams and university admission worldwide.",
      desc_my:
        "တန်း ၉–၁၂ — နိုင်ငံတကာ စာမေးပွဲများနှင့် ကမ္ဘာ့တက္ကသိုလ်များသို့ ဝင်ခွင့်အတွက် ပြင်ဆင်ပေးသည်။",
    },
  ],
};

export const FALLBACK_HOME_CTA: HomeCta = {
  title_en: "Ready to join our community?",
  title_my: "ကျွန်ုပ်တို့၏ အသိုင်းအဝိုင်းတွင် ပူးပေါင်းရန် အသင့်ဖြစ်ပြီလား?",
  text_en:
    "We would love to meet you and your family. Book a campus tour or start your application today.",
  text_my:
    "သင့်မိသားစုနှင့် တွေ့ဆုံရတာ ဝမ်းသာပါသည်။ ကျောင်းဝင်းလေ့လာရန် စာရင်းသွင်းပါ သို့မဟုတ် ယနေ့ပင် လျှောက်လွှာ စတင်ပါ။",
  button_en: "Contact Admissions",
  button_my: "ဝင်ခွင့်ဌာနကို ဆက်သွယ်ရန်",
  secondary_en: "Apply Now",
  secondary_my: "အခုပဲ လျှောက်ထားပါ",
};

/** Defaults for the About page sections, edited from the admin portal. */
export const FALLBACK_ABOUT_MISSION_VISION: AboutMissionVision = {
  mission_title_en: "Our Mission",
  mission_title_my: "ရည်ရွယ်ချက်",
  mission_text_en:
    "To nurture confident, compassionate and curious learners who think critically, communicate clearly and contribute positively to their community and the wider world.",
  mission_text_my:
    "ဝေဖန်ပိုင်းခြား တွေးခေါ်နိုင်သော၊ ရှင်းလင်းစွာ ပြောဆိုဆက်သွယ်နိုင်သော၊ မိမိပတ်ဝန်းကျင်နှင့် ကမ္ဘာ့အသိုင်းအဝိုင်းအတွက် အကျိုးပြုနိုင်သော ယုံကြည်မှုရှိသည့် ကြင်နာတတ်ပြီး စူးစမ်းလိုစိတ်ရှိသော သင်ယူသူများကို ပြုစုပျိုးထောင်ရန်။",
  vision_title_en: "Our Vision",
  vision_title_my: "မျှော်မှန်းချက်",
  vision_text_en:
    "To be the leading international school in Myanmar — a place where every student is known, valued and inspired to reach their full potential.",
  vision_text_my:
    "မြန်မာနိုင်ငံ၏ ဦးဆောင်သော နိုင်ငံတကာကျောင်း ဖြစ်လာရန် — ကျောင်းသားတိုင်းကို သိရှိနားလည်ကာ တန်ဖိုးထားပြီး မိမိ၏ အလားအလာ အပြည့်အဝ ရောက်ရှိရန် စေ့ဆော်ပေးသော နေရာ။",
  extra_cards: [],
};

export const FALLBACK_ABOUT_VALUES: AboutValues = {
  title_en: "Our Core Values",
  title_my: "အခြေခံတန်ဖိုးများ",
  values: [
    {
      title_en: "Respect",
      title_my: "လေးစားမှု",
      desc_en: "We honour every person, culture and idea, and treat others with kindness and fairness.",
      desc_my:
        "လူတိုင်း၊ ယဉ်ကျေးမှုတိုင်းနှင့် အယူအဆတိုင်းကို လေးစားပြီး ကြင်နာမှုနှင့် တရားမျှတမှုဖြင့် ဆက်ဆံပါသည်။",
    },
    {
      title_en: "Integrity",
      title_my: "ရိုးသားမှု",
      desc_en: "We act honestly and take responsibility for our words and actions.",
      desc_my:
        "ရိုးသားစွာ ပြုမူပြီး မိမိ၏ စကားနှင့် အပြုအမူများအတွက် တာဝန်ယူပါသည်။",
    },
    {
      title_en: "Excellence",
      title_my: "ထူးချွန်မှု",
      desc_en: "We set high standards, work hard and always try to improve.",
      desc_my:
        "မြင့်မားသော စံနှုန်းများ သတ်မှတ်ကာ ကြိုးစားပြီး အမြဲတမ်း တိုးတက်အောင် ကြိုးပမ်းပါသည်။",
    },
    {
      title_en: "Community",
      title_my: "အသိုင်းအဝိုင်း",
      desc_en: "We care for one another and work together — students, families and staff.",
      desc_my:
        "ကျောင်းသား၊ မိသားစုနှင့် ဝန်ထမ်းများ — အချင်းချင်း ဂရုစိုက်ပြီး အတူတကွ လုပ်ဆောင်ပါသည်။",
    },
  ],
};

/** Defaults for the "Why Choose Hope?" section, edited from the admin portal. */
export const FALLBACK_WHY_CHOOSE: WhyChoose = {
  title_en: "Why Choose Hope?",
  title_my: "Hope ကို ဘာကြောင့် ရွေးချယ်သင့်သလဲ။",
  items: [
    {
      icon: "🏫",
      title_en: "International Standards",
      title_my: "နိုင်ငံတကာ စံနှုန်းများ",
      text_en:
        "A balanced international curriculum taught in English and Burmese, preparing students for exams and universities worldwide.",
      text_my:
        "အင်္ဂလိပ်နှင့် မြန်မာဘာသာဖြင့် သင်ကြားသော နိုင်ငံတကာ သင်ရိုးညွှန်းတမ်း — ကမ္ဘာ့စာမေးပွဲများနှင့် တက္ကသိုလ်များအတွက် ကြိုပြင်ပေးပါသည်။",
    },
    {
      icon: "👩‍🏫",
      title_en: "Experienced Teachers",
      title_my: "အတွေ့အကြုံရှိ ဆရာ ဆရာမများ",
      text_en:
        "Our qualified teachers lead by example — caring for every student and holding high standards in and out of the classroom.",
      text_my:
        "အရည်အချင်းပြည့်မီသော ဆရာ ဆရာမများက ကျောင်းသားတိုင်းကို ဂရုစိုက်ပြီး စံနှုန်းမြင့် ပညာရေးကို ဦးဆောင်ပေးပါသည်။",
    },
    {
      icon: "🎓",
      title_en: "One Stop Education",
      title_my: "တစ်နေရာတည်း ပညာရေး",
      text_en:
        "From Early Years to High School on one campus — inclusive guidance and support remove the need for costly external tuition.",
      text_my:
        "နို့ဆိုင်းကနေ အထက်တန်းအထိ တစ်ကျောင်းတည်း — အခမဲ့ လမ်းညွှန်မှုများဖြင့် အခကြေးငွေကြီးမားသော အပြင်သင်တန်းများ မလိုအပ်တော့ပါ။",
    },
    {
      icon: "⚽",
      title_en: "Extra-Curricular Activities",
      title_my: "ပြင်ပလှုပ်ရှားမှုများ",
      text_en:
        "Sports, clubs and community activities give students a holistic education and prepare them for success in all aspects of life.",
      text_my:
        "အားကစား၊ ကလပ်များနှင့် လူမှုရေးလှုပ်ရှားမှုများဖြင့် ကျောင်းသားတို့၏ ဘဝအရပ်ရပ်တွင် အောင်မြင်ရေးကို ပြင်ဆင်ပေးပါသည်။",
    },
    {
      icon: "🛡️",
      title_en: "Facilities, Safety & Location",
      title_my: "အဆောက်အအုံ၊ လုံခြုံရေးနှင့် တည်နေရာ",
      text_en:
        "Modern facilities and prioritised safety in a convenient location give parents peace of mind while upholding high educational standards.",
      text_my:
        "ခေတ်မီ အဆောက်အအုံများ၊ လုံခြုံရေးနှင့် သွားလာရလွယ်ကူသော တည်နေရာက မိဘများအတွက် စိတ်ချရသော နေရာဖြစ်စေပါသည်။",
    },
    {
      icon: "🌟",
      title_en: "Quality Education for All",
      title_my: "အားလုံးအတွက် အရည်အချင်းပြည့်မီ ပညာရေး",
      text_en:
        "We make international standard education accessible to every student, bridging the gap and opening doors to the world.",
      text_my:
        "နိုင်ငံတကာ စံနှုန်းပညာရေးကို ကျောင်းသားတိုင်းအတွက် ရရှိစေပြီး ကမ္ဘာကြီးဆီသို့ တံခါးများ ဖွင့်ပေးပါသည်။",
    },
  ],
};

export const FALLBACK_ABOUT_FACTS: AboutFacts = {
  title_en: "Our School at a Glance",
  title_my: "ကျောင်း၏ တစ်ချက်ကြည့်မြင်ကွင်း",
  facts: [
    { number_en: "500+", number_my: "၅၀၀+", label_en: "Students", label_my: "ကျောင်းသား ကျောင်းသူများ" },
    { number_en: "40+", number_my: "၄၀+", label_en: "Qualified Teachers", label_my: "အရည်အချင်းပြည့်မီ ဆရာ ဆရာမများ" },
    { number_en: "12", number_my: "၁၂", label_en: "Years of Excellence", label_my: "နှစ်ပေါင်း အတွေ့အကြုံ" },
    { number_en: "1:15", number_my: "၁:၁၅", label_en: "Teacher–Student Ratio", label_my: "ဆရာ–ကျောင်းသား အချိုး" },
  ],
};

/**
 * Extra editable About page sections (two-card blocks like Mission & Vision),
 * edited from the admin portal. Empty by default — nothing renders until a
 * section is added. Stored as JSON in the `about_sections` site_content row.
 */
export const FALLBACK_ABOUT_SECTIONS: AboutCustomSection[] = [];

/** Defaults for the Academics page sections, edited from the admin portal. */
export const FALLBACK_ACADEMICS_CURRICULUM: AcademicsCurriculum = {
  title_en: "International Curriculum",
  title_my: "နိုင်ငံတကာ သင်ရိုးညွှန်းတမ်း",
  text_en:
    "Our programmes are built on internationally recognised standards and taught in English, with Myanmar language and culture as an integral part of every student's day.",
  text_my:
    "ကျွန်ုပ်တို့၏ အစီအစဉ်များသည် နိုင်ငံတကာ အသိအမှတ်ပြု စံနှုန်းများပေါ် အခြေခံပြီး အင်္ဂလိပ်ဘာသာဖြင့် သင်ကြားသည်။ မြန်မာဘာသာစကားနှင့် ယဉ်ကျေးမှုသည် ကျောင်းသားတိုင်း၏ နေ့စဉ်ဘဝ၏ အဓိကအပိုင်းတစ်ခု ဖြစ်သည်။",
  points_en: [
    "English-medium instruction from Early Years",
    "Myanmar language, history and culture classes",
    "Hands-on science, technology and arts programmes",
    "Character education woven into daily learning",
    "Small class sizes with individual attention",
  ],
  points_my: [
    "မူကြိုမှစ၍ အင်္ဂလိပ်ဘာသာဖြင့် သင်ကြားခြင်း",
    "မြန်မာစာ၊ မြန်မာ့သမိုင်းနှင့် ယဉ်ကျေးမှု သင်ခန်းစာများ",
    "လက်တွေ့ကျသော သိပ္ပံ၊ နည်းပညာနှင့် အနုပညာ အစီအစဉ်များ",
    "နေ့စဉ် သင်ယူမှုထဲ ထည့်သွင်းထားသော စရိုက်ပညာရေး",
    "တစ်ဦးချင်း အာရုံစိုက်မှုရှိသော ကျောင်းသားဦးရေ နည်းသော အတန်းများ",
  ],
};

export const FALLBACK_ACADEMICS_LEVELS: AcademicsLevels = {
  title_en: "Grade Levels",
  title_my: "အတန်းအဆင့်များ",
  levels: [
    {
      name_en: "Early Years",
      name_my: "မူကြိုပညာရေး",
      age_en: "Ages 2–5",
      age_my: "အသက် ၂–၅",
      desc_en: "Play-based learning that builds curiosity, language and social skills.",
      desc_my:
        "စူးစမ်းလိုစိတ်၊ ဘာသာစကားနှင့် လူမှုရေးစွမ်းရည်များ တည်ဆောက်ပေးသော ကစားနည်းအခြေပြု သင်ယူမှု။",
    },
    {
      name_en: "Primary School",
      name_my: "မူလတန်း",
      age_en: "Grades 1–5",
      age_my: "တန်း ၁–၅",
      desc_en: "Strong foundations in reading, writing, mathematics, science and creativity.",
      desc_my:
        "စာဖတ်၊ စာရေး၊ သင်္ချာ၊ သိပ္ပံနှင့် တီထွင်ဖန်တီးမှုတွင် ခိုင်မာသော အခြေခံအုတ်မြစ်။",
    },
    {
      name_en: "Middle School",
      name_my: "အလယ်တန်း",
      age_en: "Grades 6–8",
      age_my: "တန်း ၆–၈",
      desc_en: "Deeper subject knowledge, research skills and growing independence.",
      desc_my:
        "ဘာသာရပ်ဆိုင်ရာ အသိပညာ နက်ရှိုင်းစေပြီး သုတေသနစွမ်းရည်နှင့် ကိုယ်တိုင်လုပ်ဆောင်နိုင်မှု တိုးပွားစေသည်။",
    },
    {
      name_en: "High School",
      name_my: "အထက်တန်း",
      age_en: "Grades 9–12",
      age_my: "တန်း ၉–၁၂",
      desc_en: "Advanced studies preparing students for international examinations and universities.",
      desc_my:
        "နိုင်ငံတကာ စာမေးပွဲများနှင့် တက္ကသိုလ်များအတွက် ပြင်ဆင်ပေးသော အဆင့်မြင့် သင်ယူမှု။",
    },
  ],
};

export const FALLBACK_ACADEMICS_PROGRAMS: AcademicsPrograms = {
  title_en: "Beyond the Classroom",
  title_my: "စာသင်ခန်းအပြင်ဘက်မှ သင်ယူမှု",
  subtitle_en: "Learning continues outside lessons through clubs, sports and the arts.",
  subtitle_my:
    "ကလပ်များ၊ အားကစားနှင့် အနုပညာများမှတစ်ဆင့် သင်ခန်းစာပြင်ပတွင်လည်း ဆက်လက် သင်ယူကြသည်။",
  programs: [
    {
      title_en: "Sports & Fitness",
      title_my: "အားကစားနှင့် ကာယလေ့ကျင့်ခန်း",
      desc_en: "Football, swimming, basketball and athletics for every age group.",
      desc_my: "အသက်အုပ်စုတိုင်းအတွက် ဘောလုံး၊ ရေကူး၊ ဘတ်စကက်ဘောနှင့် ပြေးခုန်ပစ်။",
    },
    {
      title_en: "Music & Arts",
      title_my: "ဂီတနှင့် အနုပညာ",
      desc_en: "Choir, drama, painting and traditional Myanmar performing arts.",
      desc_my:
        "သံစုံတီးဝိုင်း၊ ပြဇာတ်၊ ပန်းချီနှင့် မြန်မာ့ရိုးရာ အနုပညာများ။",
    },
    {
      title_en: "STEAM Clubs",
      title_my: "STEAM ကလပ်များ",
      desc_en: "Robotics, coding, science fairs and creative engineering projects.",
      desc_my:
        "စက်ရုပ်၊ ကုဒ်ရေးခြင်း၊ သိပ္ပံပြပွဲများနှင့် တီထွင်ဖန်တီးမှု အင်ဂျင်နီယာ ပရောဂျက်များ။",
    },
    {
      title_en: "Community Service",
      title_my: "လူမှုအကျိုးပြု လုပ်ငန်းများ",
      desc_en: "Students learn leadership and compassion through service projects.",
      desc_my:
        "အကျိုးပြု ပရောဂျက်များမှတစ်ဆင့် ခေါင်းဆောင်မှုနှင့် ကရုဏာစိတ် သင်ယူကြသည်။",
    },
  ],
};