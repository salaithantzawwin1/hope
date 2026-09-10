import type {
  AboutCustomSection,
  AboutFacts,
  AboutMissionVision,
  AboutValues,
  WhyChoose,
  AcademicsCurriculum,
  AcademicsLevels,
  AcademicsPrograms,
  CarrierContent,
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
    { href: "/carrier", label_en: "Carrier", label_my: "အလုပ်အကိုင်" },
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
    { href: "/carrier", label_en: "Carrier", label_my: "အလုပ်အကိုင်" },
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
        "A balanced international curriculum from Early Years to Grade 12 — taught in English with Myanmar language and culture at its heart, opening doors to universities worldwide.",
      text_my:
        "နို့ဆိုင်းမှ ဂရိတ် ၁၂ အထိ မျှတသော နိုင်ငံတကာ သင်ရိုးညွှန်းတမ်း — အင်္ဂလိပ်ဘာသာဖြင့် သင်ကြားပြီး မြန်မာဘာသာနှင့် ယဉ်ကျေးမှုကို အခြေခံထားကာ ကမ္ဘာ့တက္ကသိုလ်များဆီ လမ်းဖွင့်ပေးပါသည်။",
    },
    {
      icon: "👩‍🏫",
      title_en: "Experienced Teachers",
      title_my: "အတွေ့အကြုံရှိ ဆရာ ဆရာမများ",
      text_en:
        "40+ qualified teachers and a 1:15 teacher–student ratio mean small classes, individual attention and role models who care about every child.",
      text_my:
        "အရည်အချင်းပြည့်မီ ဆရာ ဆရာမ ၄၀ ကျော်နှင့် ဆရာ–ကျောင်းသား ၁:၁၅ အချိုးကြောင့် အတန်းငယ်များ၊ တစ်ယောက်ချင်း ဂရုစိုက်မှုနှင့် ကလေးတိုင်းကို ချစ်မြတ်နိုးသော ဆရာကောင်းများ ရရှိပါသည်။",
    },
    {
      icon: "🧠",
      title_en: "Mind Education",
      title_my: "စိတ်ပညာရေး",
      text_en:
        "Mind education lectures by visiting experts — like Professor Dr. Gu Gyeong Hwa from Korea — and character education woven into daily learning build confidence, empathy and healthy attitudes.",
      text_my:
        "ကိုရီးယားနိုင်ငံမှ ဒေါက်တာ Gu Gyeong Hwa ကဲ့သို့ ကျွမ်းကျင်သူများ၏ စိတ်ပညာရေး ဟောပြောချက်များနှင့် နေ့စဉ်သင်ကြားမှုထဲတွင် ထည့်သွင်းထားသော စရိုက်ပညာတို့က ယုံကြည်မှု၊ သနားကြင်နာမှုနှင့် ကျန်းမာသော စိတ်သဘောထားများ ဖြစ်စေပါသည်။",
    },
    {
      icon: "⚽",
      title_en: "Extra-Curricular Activities",
      title_my: "ပြင်ပလှုပ်ရှားမှုများ",
      text_en:
        "Football, basketball, swimming, robotics, music and traditional Myanmar arts — a wide range of activities helps every student discover their strengths beyond the classroom.",
      text_my:
        "ဘောလုံး၊ ဘတ်စကက်ဘော၊ ရေကူး၊ စက်ရုပ်၊ တေးဂီတနှင့် မြန်မာရိုးရာအနုပညာ — ပြင်ပလှုပ်ရှားမှုများစွာက ကျောင်းသားတိုင်း၏ စွမ်းရည်ထူးချွန်မှုကို စာသင်ခန်းပြင်ပတွင် ရှာဖွေတွေ့ရှိစေပါသည်။",
    },
    {
      icon: "🛡️",
      title_en: "Facilities, Safety & Location",
      title_my: "အဆောက်အအုံ၊ လုံခြုံရေးနှင့် တည်နေရာ",
      text_en:
        "Modern facilities, a caring culture of safety and an easy-to-reach location give families complete peace of mind every school day.",
      text_my:
        "ခေတ်မီ အဆောက်အအုံများ၊ ဂရုစိုက်သော လုံခြုံရေးစနစ်နှင့် သွားလာရလွယ်ကူသော တည်နေရာက မိသားစုတိုင်းအတွက် ကျောင်းနေရသမျှ စိတ်ချမ်းသာမှု ပေးပါသည်။",
    },
    {
      icon: "🌟",
      title_en: "Quality Education for All",
      title_my: "အားလုံးအတွက် အရည်အချင်းပြည့်မီ ပညာရေး",
      text_en:
        "Every student is known, valued and inspired to reach their full potential — international-quality education made accessible to families in Myanmar.",
      text_my:
        "ကျောင်းသားတိုင်းကို သိရှိနားလည်ကာ တန်ဖိုးထားပြီး မိမိ၏ အလားအလာ အပြည့်အဝ ရောက်ရှိရန် စေ့ဆော်ပေးပါသည် — နိုင်ငံတကာအရည်အသွေးမြင့် ပညာရေးကို မြန်မာမိသားစုများ ရရှိနိုင်အောင် ပြုလုပ်ပေးပါသည်။",
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

/**
 * Fill in fields that may be missing on older saved Carrier content and
 * migrate the legacy single requirements list onto every position.
 * Per-job step/contact overrides that are empty are cleared so they
 * inherit the global values.
 */
export function normalizeCarrier(
  parsed: Partial<CarrierContent> & {
    requirements_en?: string[];
    requirements_my?: string[];
  },
): CarrierContent {
  const merged = { ...FALLBACK_CARRIER, ...parsed } as CarrierContent;
  const legacyEn = parsed.requirements_en ?? [];
  const legacyMy = parsed.requirements_my ?? [];
  merged.positions = merged.positions.map((pos) => ({
    ...pos,
    requirements_en: pos.requirements_en?.length ? pos.requirements_en : legacyEn,
    requirements_my: pos.requirements_my?.length ? pos.requirements_my : legacyMy,
    active: pos.active ?? true,
    apply_steps_en: pos.apply_steps_en?.length ? pos.apply_steps_en : undefined,
    apply_steps_my: pos.apply_steps_my?.length ? pos.apply_steps_my : undefined,
    contact_phone_en: pos.contact_phone_en?.trim() ? pos.contact_phone_en : undefined,
    contact_phone_my: pos.contact_phone_my?.trim() ? pos.contact_phone_my : undefined,
    contact_email_en: pos.contact_email_en?.trim() ? pos.contact_email_en : undefined,
    contact_email_my: pos.contact_email_my?.trim() ? pos.contact_email_my : undefined,
    contact_note_en: pos.contact_note_en?.trim() ? pos.contact_note_en : undefined,
    contact_note_my: pos.contact_note_my?.trim() ? pos.contact_note_my : undefined,
  }));
  return merged;
}

/** Defaults for the Carrier page, edited from the admin portal. */
export const FALLBACK_CARRIER: CarrierContent = {
  hero_title_en: "We Are Hiring",
  hero_title_my: "ကျွန်ုပ်တို့ လက်ခံနေပါသည်",
  hero_subtitle_en: "Join our team of passionate educators and staff at Hope International School.",
  hero_subtitle_my: "Hope အပြည်ပြည်ဆိုင်ရာကျောင်းတွင် စိတ်အားထက်သန်သော ပညာရေးဆရာနှင့် ဝန်ထမ်းအဖွဲ့တွင် ပူးပေါင်းပါ။",
  why_title_en: "Why Join Hope?",
  why_title_my: "ဘာကြောင့် Hope တွင် အလုပ်လုပ်သင့်သလဲ?",
  why_text_en:
    "At Hope International School, you will be part of a supportive community that values innovation, collaboration and professional growth. We offer competitive benefits, ongoing training opportunities and a vibrant work environment.",
  why_text_my:
    "Hope အပြည်ပြည်ဆိုင်ရာကျောင်းတွင် တီထွင်ဖန်တီးမှု၊ ပူးပေါင်းဆောင်ရွက်မှုနှင့် ပညာရေးဖွံ့ဖြိုးတိုးတက်မှုကို တန်ဖိုးထားသည့် ပံ့ပိုးမှုရှိသော အသိုင်းအဝိုင်းတစ်ခု၏ အစိတ်အပိုင်းတစ်ခု ဖြစ်လာပါမည်။",
  positions_title_en: "Job Positions",
  positions_title_my: "အလုပ်ခွင်များ",
  positions_subtitle_en: "Current opportunities at Hope International School.",
  positions_subtitle_my: "Hope အပြည်ပြည်ဆိုင်ရာကျောင်းတွင် လက်ရှိ အလုပ်ခွင်များ။",
  positions: [
    {
      title_en: "Year 3-4 Science & Year 1-4 ICT",
      title_my: "တန်း ၃-၄ သိပ္ပံနှင့် တန်း ၁-၄ ICT",
      type_en: "Part-time",
      type_my: "အပိုင်းအချိန်",
      desc_en: "Working days: Monday to Friday",
      desc_my: "အလုပ်လုပ်ရက် — တနင်္လာမှ သောကြာ",
      requirements_en: [
        "Relevant Bachelor degree holder",
        "Teaching certification or license (if applicable)",
        "Additional qualification in ESL/EAL, Early Childhood is an advantage",
        "Minimum 2 years of teaching experience in an international primary/elementary school",
        "English proficiency (4 skills) at a professional teaching level",
        "Ability to communicate clearly with students and parents",
        "Able to use basic education technology",
        "Willingness to attend school events, parent meetings, PD training",
      ],
      requirements_my: [
        "သက်ဆိုင်ရာ ဘွဲ့ကြိုက်းရှိသူ",
        "သင်ကြားခွင့်လက်မှတ် သို့မဟုတ် လိုင်စင် (ရှိပါက)",
        "ESL/EAL၊ မူကြိုပညာရေးတွင် ထပ်ဆောင်းအရည်အချင်းရှိပါက အားသာချက်ဖြစ်သည်",
        "နိုင်ငံတကာ မူလတန်းကျောင်းတွင် အနည်းဆုံး သင်ကြားရေးအတွေ့အကြုံ နှစ် ၂ ရှိရမည်",
        "အင်္ဂလိပ်ဘာသာ ကျွမ်းကျင်မှု (စွမ်းရည် ၄ ခု) — ပညာရေးဆရာအဆင့်",
        "ကျောင်းသားများနှင့် မိဘများနှင့် ရှင်းလင်းစွာ ဆက်သွယ်နိုင်မှု",
        "အခြေခံပညာရေးနည်းပညာကို အသုံးပြုနိုင်မှု",
        "ကျောင်းပွဲများ၊ မိဘအစည်းအဝေးများ၊ PD လေ့ကျင့်ရေးများတွင် တက်ရောက်ရန် ဆန္ဒရှိမှု",
      ],
      active: true,
    },
    {
      title_en: "English Teacher (Primary)",
      title_my: "အင်္ဂလိပ်စာ ဆရာ/ဆရာမ (မူလတန်း)",
      type_en: "Full-time",
      type_my: "အချိန်ပြည့်",
      desc_en: "Teach English language and literature to Primary students in an immersive, English-speaking classroom.",
      desc_my: "အင်္ဂလိပ်ဘာသာဖြင့် ဆက်သွယ်ပြောဆိုသော ခန်းမှာ မူလတန်း ကျောင်းသားများကို အင်္ဂလိပ်စာနှင့် စာပေ သင်ကြားပေးမည်။",
      requirements_en: [
        "Bachelor's degree in English, Education or a related field",
        "Minimum 2 years of experience teaching primary English",
        "Excellent spoken and written English",
        "Warm, patient and passionate about young learners",
        "Willing to participate in school activities and parent meetings",
      ],
      requirements_my: [
        "အင်္ဂလိပ်စာ၊ ပညာရေး (သို့) နယ်ပယ်နီးစပ်သည့် ဘွဲ့ရှိသူ",
        "မူလတန်း အင်္ဂလိပ်စာ သင်ကြားရေး အတွေ့အကြုံ အနည်းဆုံး ၂ နှစ် ရှိရမည်",
        "အင်္ဂလိပ်စကားပြောနှင့် ရေးသားမှု ကျွမ်းကျင်စွာ ပြောနိုင်၊ ရေးနိုင်ရမည်",
        "ကလေးငယ်များအပေါ် ဂရုစိုက်ပြီး စိတ်အားထက်သန်သူ ဖြစ်ရမည်",
        "ကျောင်းပွဲများနှင့် မိဘအစည်းအဝေးများတွင် ပါဝင်ဆောင်ရွက်နိုင်ရမည်",
      ],
      active: true,
    },
    {
      title_en: "Mathematics Teacher (Middle School)",
      title_my: "သင်္ချာ ဆရာ/ဆရာမ (အလယ်တန်း)",
      type_en: "Full-time",
      type_my: "အချိန်ပြည့်",
      desc_en: "Teach Mathematics to Grade 5–8 students following the international curriculum.",
      desc_my: "နိုင်ငံတကာ သင်ရိုးညွှန်းတမ်းအတိုင်း တန်း ၅-၈ ကျောင်းသားများကို သင်္ချာ သင်ကြားပေးမည်။",
      requirements_en: [
        "Bachelor's degree in Mathematics or a related field",
        "Teaching certification is an advantage",
        "At least 2 years of experience teaching middle school Mathematics",
        "Able to explain concepts clearly to mixed-ability classes",
        "Confident using smartboards and educational software",
      ],
      requirements_my: [
        "သင်္ချာ (သို့) နယ်ပယ်နီးစပ်သည့် ဘွဲ့ရှိသူ",
        "သင်ကြားခွင့်လက်မှတ် ရှိပါက အားသာချက်ဖြစ်သည်",
        "အလယ်တန်း သင်္ချာ သင်ကြားရေး အတွေ့အကြုံ အနည်းဆုံး ၂ နှစ် ရှိရမည်",
        "စွမ်းရည်ကွာခြားသော ကျောင်းသားများကို ရှင်းလင်းစွာ ရှင်းပြနိုင်ရမည်",
        "Smartboard နှင့် ပညာရေးဆော့ဖ်ဝဲများကို ယုံကြည်စိတ်ချစွာ အသုံးပြုနိုင်ရမည်",
      ],
      active: true,
    },
    {
      title_en: "School Librarian",
      title_my: "ကျောင်းစာကြည့်တိုက်မှူး",
      type_en: "Part-time",
      type_my: "အပိုင်းအချိန်",
      desc_en: "Manage the school library, reading programmes and book borrowing for all grades.",
      desc_my: "ကျောင်းစာကြည့်တိုက်ကို စီမံခန့်ခွဲပြီး အတန်းအားလုံးအတွက် ဖတ်ရှုရေးအစီအစဉ်များနှင့် စာအုပ်ငှားပြန်စနစ်ကို တာဝန်ယူမည်။",
      requirements_en: [
        "Bachelor's degree in any field (Library Science is an advantage)",
        "Love of books and experience encouraging children to read",
        "Basic computer skills for catalogue and borrowing records",
        "Well-organised, friendly and dependable",
        "Able to communicate politely with students, teachers and parents",
      ],
      requirements_my: [
        "မည်သည့်နယ်ပယ်မဆို ဘွဲ့ရှိသူ (Library Science ဘွဲ့ရှိပါက အားသာချက်)",
        "စာအုပ်များကို ချစ်မြတ်နိုးပြီး ကလေးများကို စာဖတ်ရန် တွန်းအားပေးတတ်သူ",
        "စာရင်းအင်းများအတွက် ကွန်ပျူတာအခြေခံ အသုံးပြုနိုင်မှု",
        "စနစ်တကျ စီစဉ်တတ်ပြီး ယုံကြည်ရသော စိတ်ရှိရမည်",
        "ကျောင်းသား၊ ဆရာ၊ မိဘများနှင့် ယဉ်ကျေးစွာ ဆက်သွယ်နိုင်ရမည်",
      ],
      active: true,
    },
  ],
  requirements_title_en: "Job Requirements",
  requirements_title_my: "အလုပ်ခွင် လိုအပ်ချက်များ",
  apply_title_en: "How to Apply",
  apply_title_my: "လျှောက်ထားနည်း",
  apply_steps_en: [
    { title: "Prepare Documents", desc: "Update your CV and prepare a cover letter." },
    { title: "Send Application", desc: "Email your CV & Cover Letter to us." },
    { title: "Interview", desc: "Shortlisted candidates will be contacted for an interview." },
  ],
  apply_steps_my: [
    { title: "စာရွက်စာတမ်းများ ပြင်ဆင်ပါ", desc: "သင့် CV ကို update လုပ်ပြီး cover letter ပြင်ဆင်ပါ။" },
    { title: "လျှောက်လွှာ ပေးပို့ပါ", desc: "သင့် CV & Cover Letter ကို အီးမေးလ်ဖြင့် ပေးပို့ပါ။" },
    { title: "တွေ့ဆုံမေးမြန်းပါ", desc: "ရွေးချယ်ခံရသူများကို တွေ့ဆုံမေးမြန်းရန် ဆက်သွယ်ပါမည်။" },
  ],
  contact_phone_en: "09 530 2325 (Viber & Telegram)",
  contact_phone_my: "09 530 2325 (Viber & Telegram)",
  contact_email_en: "hr@hopeinternationalschool.com",
  contact_email_my: "hr@hopeinternationalschool.com",
  contact_note_en: "Send your CV & Cover Letter",
  contact_note_my: "သင့် CV & Cover Letter ကို ပေးပို့ပါ",
};