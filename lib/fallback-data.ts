import type { EventItem, NewsItem } from "./types";

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
};