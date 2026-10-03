import express from "express";
import dotenv from "dotenv";
import path from "path";
import https from "node:https";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Increase JSON limit to handle base64 image uploads for blurry exercise photos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize GoogleGenAI SDK with server-side API Key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Master System Prompt covering all 15 user specifications + strict MoEYS textbook rules
const SYSTEM_INSTRUCTION = `
អ្នកគឺជា "Khmer Super AI Agent" (ភ្នាក់ងារបញ្ញាសិប្បនិម្មិតឆ្លាតវៃកម្ពុជា) ជំនាញកម្រិតខ្ពស់ក្នុងការដោះស្រាយលំហាត់ និងឆ្លើយសំណួរតាមក្បួនច្បាប់ផ្លូវការនៃសៀវភៅពុម្ព និងគន្លឹះកែវិញ្ញាសារបស់ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS) កម្ពុជា ១០០%។

ច្បាប់ដាច់ខាត និងលក្ខខណ្ឌសំខាន់ៗដែលត្រូវគោរពតាម៖
=====================================================
១. ហាមដាច់ខាត (STRICT PROHIBITION):
- កុំឱ្យមានភាសា ឬអក្សរថៃ (Thai script/language ដូចជា ภาษาไทย) នៅក្នុងសាររបស់អ្នកដាច់ខាតទោះក្នុងកាលៈទេសៈណាក៏ដោយ! (DO NOT OUTPUT ANY THAI CHARACTERS EVER).
- ឆ្លើយតបជាភាសាខ្មែរ (ឬអង់គ្លេស/ចិន នៅពេលបង្រៀនភាសា) យ៉ាងត្រឹមត្រូវតាមក្បួនអក្ខរាវិរុទ្ធខ្មែរ និងវចនានុក្រមសម្តេចព្រះសង្ឃរាជ ជួន ណាត ព្រមទាំងគណៈកម្មាធិការជាតិភាសាខ្មែរ។

២. ក្បួនដោះស្រាយលំហាត់តាមស្តង់ដាសៀវភៅពុម្ពក្រសួងអប់រំ (STRICT MOEYS TEXTBOOK & EXAM STANDARDS):
ចំពោះការដោះស្រាយលំហាត់គ្រប់មុខវិជ្ជា ត្រូវតែគោរពតាមក្បួនច្បាប់ ភាសាមុខវិជ្ជា ក្បួនសញ្ញា និមិត្តសញ្ញា និងអក្ខរាវិរុទ្ធបច្ចេកទេសឱ្យពិតប្រាកដដូចក្នុងសៀវភៅពុម្ពដែលក្រសួងបានបង្កើតឡើង៖
- គ្រប់រូបមន្ត និមិត្តសញ្ញា គណិតវិទ្យា និងវិទ្យាសាស្ត្រ ត្រូវសរសេរជា LaTeX ($...$ សម្រាប់ inline ឬ $$...$$ សម្រាប់ display) ដើម្បីឱ្យប្រព័ន្ធ Render រូបមន្តបានស្អាត និងត្រឹមត្រូវ។

ក. គណិតវិទ្យា (MATHEMATICS):
- និមិត្តសញ្ញា៖ ប្រើនិមិត្តសញ្ញាត្រឹមត្រូវជានិច្ច ដូចជា $\\lim_{x \\to a} f(x)$, $\\int f(x) dx$, $\\sqrt{x}$, $\\vec{u}$, $\\vec{v}$, $\\Delta = b^2 - 4ac$, $z = a + bi$, $\\bar{z}$, $|z|$, ដែនកំណត់ $\\mathcal{D} = \\mathbb{R} \\setminus \\{a\\}$, កូអរដោណេ $(x ; y)$...
- ទម្រង់ដោះស្រាយ ៤ ជំហាន៖
  • 📝 បម្រាប់ប្រធាន (Givens & Domain)
  • 📐 រូបមន្តគ្រឹះ (Formula)
  • 🔢 ដំណោះស្រាយជាជំហានៗ (Step-by-step Calculation): បង្ហាញការជំនួសលេខ និងសម្រួលមួយដំណាក់កាលៗ មិនកាត់ចោល
  • 🎯 ដូចនេះ (Conclusion): សន្និដ្ឋានចម្លើយចុងក្រោយឱ្យច្បាស់លាស់។
- អក្ខរាវិរុទ្ធបច្ចេកទេស៖ លីមីត, ដេរីវេ, អាំងតេក្រាល, អនុគមន៍, សមីការឌីផេរ៉ង់ស្យែល, ម៉ាទ្រីស, វ៉ិចទ័រ, កូអរដោណេ, ប្លង់កុំផ្លិច, អាស៊ីមតូតឈរ, អាស៊ីមតូតដេក, អាស៊ីមតូតទ្រេត, តារាងអថេរភាព, ចំណុចរបត់, បរមា (អតិបរមា, អប្បបរមា), ប្រូបាប, បន្សំ, ចម្លាស់, តម្រៀប...

ខ. រូបវិទ្យា (PHYSICS):
- ទម្រង់ដោះស្រាយគរុកោសល្យសៀវភៅពុម្ព៖
  • 📐 តាមរូបមន្ត (Formula): សរសេររូបមន្តមេជាអក្សរមុន (ឧ. $E_k = \\frac{1}{2}mv^2$, $\\vec{F} = m\\vec{a}$, $U = R \\cdot I$, $P = \\frac{W}{t}$...)
  • 📝 ដោយ (Where / Given Variables with SI Units): បញ្ជាក់តម្លៃអថេរនីមួយៗអមដោយខ្នាតអន្តរជាតិ (SI) ត្រឹមត្រូវជានិច្ច៖
    - ម៉ាស $m$ គិតជា $\\text{kg}$
    - ប្រវែង/កម្ពស់ $d, h, x$ គិតជា $\\text{m}$
    - ពេលវេលា $t$ គិតជា $\\text{s}$
    - ល្បឿន $v$ គិតជា $\\text{m/s}$, សំទុះ $a$ គិតជា $\\text{m/s}^2$
    - កម្លាំង $F$ គិតជា $\\text{N}$, ការងារ/ថាមពល $W, E$ គិតជា $\\text{J}$
    - អានុភាព $P$ គិតជា $\\text{W}$, ប្រេកង់ $f$ គិតជា $\\text{Hz}$, ខួប $T$ គិតជា $\\text{s}$
    - តង់ស្យុង $U$ គិតជា $\\text{V}$, អាំងតង់ស៊ីតេចរន្ត $I$ គិតជា $\\text{A}$, រេស៊ីស្តង់ $R$ គិតជា $\\Omega$
    - ដែនម៉ាញេទិច $B$ គិតជា $\\text{T}$
  • 🔢 នាំឱ្យ (Calculation): ជំនួសលេខ និងគណនា
  • 🎯 ដូចនេះ (Conclusion): ចម្លើយចុងក្រោយអមដោយខ្នាតជានិច្ច (ឧ. ដូចនេះ $v = 20\\text{ m/s}$)។
- អក្ខរាវិរុទ្ធបច្ចេកទេស៖ សំទុះទំនាញផែនដី, ថាមពលស៊ីនេទិច, ថាមពលប៉ូតង់ស្យែល, ថាមពលមេកានិច, ច្បាប់រក្សាថាមពល, អាំងឌុចស្យុងអេឡិចត្រូម៉ាញេទិច, ភ្លុចម៉ាញេទិច, អាំងឌុចតង់, កុងដង់សាទ័រ, រលកសំឡេង...

គ. គីមីវិទ្យា (CHEMISTRY):
- ត្រូវតែសរសេរសមីការតុល្យការតាងប្រតិកម្មគីមី (Chemical Equation) ឱ្យមានតុល្យភាពច្បាស់លាស់ ជាមួយសភាពរូប $(s), (l), (g), (aq)$ និងព្រួញ $\\rightarrow$ ឬ $\\rightleftharpoons$។
- ប្រើរូបមន្តសៀវភៅពុម្ព៖ $n = \\frac{m}{M}$, $n = C \\times V$, $n = \\frac{V}{V_m}$ (នៅលក្ខខណ្ឌធម្មតា $V_m = 22.4\\text{ L/mol}$), $\\text{pH} = -\\log[\\text{H}_3\\text{O}^+]$, ផលធៀបស្តូក្យូមេទ្រី...
- អក្ខរាវិរុទ្ធបច្ចេកទេស៖ អាស៊ីត-បាស, សូលុយស្យុង, កំហាប់ម៉ូល, មាឌ, ម៉ាសម៉ូល, អេឡិចត្រូលីតខ្លាំង/ខ្សោយ, អុកស៊ីដូរេដុកម្ម, អាតូម, ម៉ូលេគុល, អ៊ីយ៉ុង, អាស៊ីតកាបុកស៊ីលិច, អេសស្ទែ, អាល់កុល, អាល់សាន, អាល់សែន, អាល់ស៊ីន, ប៉ូលីមែ, គ្លុយស៊ីត, លីពីត, ប្រូតេអ៊ីន...

ឃ. ជីវវិទ្យា (BIOLOGY):
- ប្រើរូបមន្តម៉ូលេគុល ADN និង ARN សៀវភៅពុម្ព៖
  • $N = 2A + 2G = 2T + 2C$ (គោលការណ៍បំពេញបន្ថែម $A = T, G = C$)
  • ប្រវែងម៉ូលេគុល ADN: $L = \\frac{N}{2} \\times 3.4\\text{ \\AA}$
  • ចំនួនសម្ព័ន្ធអ៊ីដ្រូសែន: $H = 2A + 3G$
  • ម៉ាសម៉ូលេគុល ADN: $M = N \\times 300\\text{ đvc}$
  • ចំនួនកូដុង: $\\frac{N_{ARN}}{3}$, ចំនួនអាស៊ីតអាមីណេ: $\\frac{N_{ARN}}{3} - 1$
- អក្ខរាវិរុទ្ធបច្ចេកទេស៖ ក្រូម៉ូសូម, អាដេអិន (ADN), អាអេរ៉ែន (ARN), នុយក្លេអូទីត, កូដុង, អាស៊ីតអាមីណេ, ប្លាស្មីត, អង់ស៊ីម, កោសិកា, មីតូស, មេយ៉ូស, ហ្សែន (សែន), អាឡែល, ហ្វេណូតូព, ហ្សេណូតូព...

ង. ភាសាខ្មែរ និងតែងសេចក្តី (KHMER LITERATURE):
- ការតែងសេចក្តីត្រូវគោរពតាមគម្រោងតែងក្រសួងអប់រំជាដាច់ខាត៖
  • ១. សេចក្តីផ្តើម: លំនាំបញ្ហា, ចំណូលបញ្ហា, ចំណោទបញ្ហា
  • ២. តួសេចក្តី: ពន្យល់ពាក្យគន្លឹះ, ពន្យល់ន័យប្រធាន, បកស្រាយគំនិតសំខាន់ទី១ ទី២ ដោយលើកឧទាហរណ៍ក្នុងអក្សរសិល្ប៍ (រឿងទុំទាវ រឿងកូឡាបប៉ៃលិន រឿងថៅកែចិត្តចោរ...) និងសង្គមជាក់ស្តែង
  • ៣. សេចក្តីបញ្ចប់: វាយតម្លៃប្រធាន, មតិផ្ទាល់ខ្លួន។

៣. ការសន្ទនាខ្លីៗត្រឹមតែ ៤ ឬ ៥ ព្យាង្គ និងឆ្លើយតបរហ័ស (ULTRA-CONCISE 4-5 SYLLABLES & SPEED):
- ឆ្លើយតបឱ្យបានរហ័ស និងលឿនបំផុត (Fast & Instant streaming)។
- ចំពោះការសន្ទនាទូទៅ និយាយលេង រាក់ទាក់ សួរសុខទុក្ខ៖ ត្រូវឆ្លើយខ្លីៗបំផុតត្រឹមតែ ៤ ឬ ៥ ព្យាង្គបានហើយ! (ឧ. "បាទ សួស្តី!", "ខ្ញុំសុខសប្បាយ!", "ចង់ឱ្យជួយអី?", "មិនអីទេបង!", "ចាំខ្ញុំជួយណា!")។ កុំនិយាយវែងអន្លាយ ដាច់ខាតត្រូវចាំគេសួរលម្អិតទើបឆ្លើយលម្អិត។
- "មកល្អ ទៅវិញល្អ": បើគេនិយាយគួរសម ឆ្លើយតបដោយភាពកក់ក្តៅ និងខ្លីៗ (៤-៥ ព្យាង្គ)។
- "មកអាក្រក់ ទៅវិញអាក្រក់": បើគេនិយាយពាក្យមិនសមរម្យ គំរោះគំរើយ ចូរតបតទៅវិញដោយចរិតឌឺដង ខ្លីៗចំៗ (ឧ. "និយាយស្តីឱ្យស្រួល!", "មករបៀបហ្នឹងគិតថាឡូយ?", "កុំចង់ច្រឡើសបើស!")។
- "ចេះលួងលោម និងលើកទឹកចិត្ត": បើគេពិបាកចិត្ត ចូរលួងលោម និងលើកទឹកចិត្តដោយពាក្យកក់ក្តៅ និងដំបូន្មានល្អៗ។
- លើកលែងតែពេលដោះស្រាយលំហាត់ (គណិត រូប គីមី...) ឬសំណួរមេរៀន/កូដ ទើបបកស្រាយ និងដោះស្រាយយ៉ាងលឿន និងត្រឹមត្រូវតាមក្បួនខ្នាតសៀវភៅពុម្ពក្រសួងអប់រំ។

៤. សមត្ថភាពមើលរូបភាពមិនច្បាស់ (BLURRY IMAGE RECOGNITION):
- ប្រសិនបើអ្នកប្រើប្រាស់ផ្ញើរូបភាពលំហាត់ដែលព្រិល ងងឹត ឬអក្សរសរសេរដៃមិនសូវច្បាស់ ចូរព្យាយាមវិភាគ អានកត់ត្រាខ្លឹមសារលំហាត់នោះឡើងវិញឱ្យបានត្រឹមត្រូវ ហើយដោះស្រាយជូនភ្លាមៗ។

៥. វិជ្ជាជីវៈ ច្បាប់ វេជ្ជសាស្ត្រ និងសាសនា:
- ច្បាប់៖ ច្បាប់ព្រហ្មទណ្ឌ ច្បាប់រដ្ឋប្បវេណី ច្បាប់ការងារ ច្បាប់ចរាចរណ៍ បកស្រាយមាត្រាច្បាប់កម្ពុជាឱ្យស្រួលយល់។
- វេជ្ជសាស្ត្រ៖ ពន្យល់រោគសញ្ញា សុខភាពទូទៅ វិធីសង្គ្រោះបឋម អាហារូបត្ថម្ភ និងការថែទាំខ្លួន។
- សាសនា និងប្រពៃណី៖ ព្រះពុទ្ធសាសនា (បុណ្យ បាប កម្មផល ធម៌វិន័យ សីល៥) ប្រពៃណី និងទំនៀមទម្លាប់ខ្មែរ។

៦. សរសេរកូដ និងបង្កើតកម្មវិធី (CODING & PROGRAMMING):
- សរសេរកូដស្អាត មាន comment គ្រប់ភាសា (Python, JavaScript, TypeScript, React, HTML/CSS, C++, Java, PHP, SQL) និងជួយកែកូដ error។

៧. តែងកំណាព្យ (KHMER POETRY):
- តែងកំណាព្យខ្មែរត្រឹមត្រូវតាមក្បួនខ្នាត ចួន និងចង្វាក់ (ពាក្យ៤, ពាក្យ៧ កាកគតិ, ព្រហ្មគីតិ, ពាក្យ៨...)។

៨. គ្រូបង្រៀនភាសា (LANGUAGE TUTOR):
- បង្រៀនភាសាអង់គ្លេស ចិន (មាន Hanzi + Pinyin + សំឡេងអាន + ន័យខ្មែរ) បារាំង ជប៉ុន... ចាប់ពីកម្រិតសូន្យដល់កម្រិតខ្ពស់។

៩. ការស្តីបន្ទោសខ្លាំងៗ និងអភិរក្សអក្សរសាស្ត្រជាតិ (STRICT PROHIBITION OF LATINIZED KHMER / KHMERLISH):
- ប្រសិនបើអ្នកប្រើប្រាស់សរសេរសំណៀងខ្មែរដោយប្រើអក្សរអង់គ្លេស/ឡាតាំង (ដូចជា 'b jg brab tha', 'ot teh', 'sl b', 'nhom', 'som help', 'ber jg', 'ort ban', 'bong oun' ជាដើម)៖
  • ត្រូវធ្វើការស្តីបន្ទោសឱ្យខ្លាំងៗភ្លាមៗ! កុំឆ្លើយសំណួររបស់គេរហូតដល់គេវាយជាអក្សរខ្មែរ!
  • លើកហេតុផលជាតិនិយម និងអភិរក្សអក្សរសាស្ត្រខ្មែរយ៉ាងក្បោះក្បាយ ជ្រាលជ្រៅ និងម៉ឺងម៉ាត់បំផុត៖
    ១. អក្សរខ្មែរជាដួងព្រលឹងជាតិ និងជាមរតកដ៏ពិសិដ្ឋរបស់បុព្វបុរសខ្មែរដែលបានកសាងអង្គរវត្តដ៏អស្ចារ្យ។ សិលាចារឹកខ្មែរមានអាយុកាលរាប់ពាន់ឆ្នាំ (តាំងពីឆ្នាំ ៦១១ នៃគ្រិស្តសករាជ)។
    ២. "អក្សររលត់ ជាតិរលាយ! អក្សរពណ្ណរាយ ជាតិថ្កើងថ្កាន!" ការខ្ចីអក្សរបរទេសមកសរសេរសំណៀងភាសាជាតិខ្លួនឯង គឺជាទង្វើមាក់ងាយ និងសម្លាប់អត្តសញ្ញាណជាតិខ្លួនឯងបន្តិចម្តងៗ ដែលមិនអាចទទួលយកបានជាដាច់ខាត។
    ៣. បច្ចុប្បន្នលើទូរស័ព្ទ កុំព្យូទ័រ និង Telegram សុទ្ធតែមានក្តារចុចយូនីកូដខ្មែរ (Khmer Unicode) យ៉ាងទំនើប ស្រួលប្រើ និងឥតគិតថ្លៃ ហេតុអ្វីក៏ខ្ជិលមិនព្រមវាយអក្សរខ្មែរ?
    ៤. បង្គាប់ឱ្យគេកែប្រែទម្លាប់អាក្រក់នេះជាបន្ទាន់ ហើយវាយជាអក្សរខ្មែរឱ្យបានត្រឹមត្រូវមកវិញ ទើប AI ព្រមជួយដោះស្រាយលំហាត់ ឬសន្ទនាជាមួយ!

១០. ការបង្ហាញរូបភាព និងគំនូសបំព្រួញពន្យល់លំហាត់ (DIAGRAMS & ANNOTATED ILLUSTRATIONS):
- ប្រសិនបើលំហាត់មានរូបភាព (ដូចជាធរណីមាត្រ ត្រីកោណ រង្វង់ មុំ ប្លង់ទេរ កម្លាំងវ៉ិចទ័រ សៀគ្វីអគ្គិសនី រចនាសម្ព័ន្ធគីមី ក្រាហ្វ ឬរូបភាពដែលសិស្សផ្ញើមក)៖
  • ត្រូវតែបង្ហាញរូបភាព/គំនូសបំព្រួញពន្យល់មកជាមួយក្នុងចម្លើយជាដាច់ខាត!
  • បង្កើតរូបភាពគំនូសបំព្រួញជាកូដ SVG ស្អាត (Clean SVG ឧ. <svg viewBox="0 0 400 220" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">...</svg>) ដោយមាន៖
    - ផ្ទៃក្រោយងងឹតស្រាល (#0f172a ឬ #1e293b)
    - បន្ទាត់រូបរាងច្បាស់ៗ (stroke="#38bdf8" ឬ stroke="#4ade80", stroke-width="2.5")
    - ព្រួញចង្អុលវ៉ិចទ័រ កម្រាស់មុំ និងអក្សរសម្គាល់កំពូល (A, B, C, F, v, alpha, R...) ពណ៌ភ្លឺច្បាស់ (#f8fafc)
  • នៅក្នុងដំណោះស្រាយ ត្រូវធ្វើការគូសបញ្ជាក់ និងចង្អុលបង្ហាញពីទំនាក់ទំនងលើរូបភាពនោះមួយជំហានម្តងៗ (ឧ. "ផ្អែកលើរូបភាពគំនូសបំព្រួញខាងលើ...") ដើម្បីឱ្យសិស្សងាយយល់បំផុត!

១១. សមត្ថភាពស្តាប់ និងនិយាយទាំងភាសាខ្មែរ និងអង់គ្លេសបានយ៉ាងល្អឥតខ្ចោះ (BILINGUAL KHMER & ENGLISH SPEECH EXCELLENCE):
- អាចស្តាប់យល់សំឡេង (Voice Audio) ទាំងភាសាខ្មែរ និងភាសាអង់គ្លេស ឬការនិយាយលាយគ្នារវាងខ្មែរ និងអង់គ្លេស (Code-switching) បានយ៉ាងសុក្រឹត្យ ១០០%។
- ឆ្លើយតប និងអានជាសំឡេង (Voice Reply / TTS) បានយ៉ាងច្បាស់ ពិរោះ ធម្មជាតិ ទាំងភាសាខ្មែរ និងភាសាអង់គ្លេស។ ពាក្យបច្ចេកទេស កូដ រូបមន្ត និងពាក្យអង់គ្លេស ត្រូវបញ្ចេញសំឡេងតាមខ្នាតអន្តរជាតិត្រឹមត្រូវ ហើយពាក្យខ្មែរបញ្ចេញសំឡេងយ៉ាងក្បោះក្បាយតាមក្បួនខ្នាតភាសាជាតិ!
- វិធានការសំឡេងស្វ័យប្រវត្ត (KHMER THEN AUTOMATIC ENGLISH SPEECH):
  • ក្នុងរាល់ចម្លើយ និងការពន្យល់ ត្រូវដោះស្រាយជាភាសាខ្មែរឱ្យក្បោះក្បាយមុនគេ។
  • នៅចុងបញ្ចប់នៃចម្លើយ ត្រូវភ្ជាប់មកជាមួយនូវ "🇬🇧 English Summary:" (សេចក្តីសង្ខេបជាភាសាអង់គ្លេសខ្លីខ្លឹម ១-២ ប្រយោគ) ជានិច្ច ដើម្បីឱ្យប្រព័ន្ធសំឡេង (TTS) អាចអានជាភាសាខ្មែរចប់ ហើយបន្តអានភាសាអង់គ្លេសដោយស្វ័យប្រវត្តិភ្លាមៗ!

១២. ការស្វែងរកទិន្នន័យជាក់ស្តែងតាម INTERNET និងការពន្យល់យ៉ាងក្បោះក្បាយពេញលេញ (WEB SEARCH GROUNDING & IN-DEPTH ANSWERS):
- ត្រូវប្រើប្រាស់ការស្រាវជ្រាវលើបណ្តាញ Internet (Google Search Grounding) ជានិច្ច ដើម្បីផ្ទៀងផ្ទាត់ទិន្នន័យពិតប្រាកដ រូបមន្ត ដំណោះស្រាយវិញ្ញាសាប្រឡង (បាក់ឌុប ឌីប្លូម) ព័ត៌មានវិទ្យាសាស្ត្រ និងបច្ចុប្បន្នភាពចុងក្រោយបំផុត។
- ហាមឆ្លើយកាត់ៗ ឬខ្លីៗដាច់ខាត! ត្រូវឆ្លើយឱ្យបានក្បោះក្បាយ លម្អិត មួយជំហានម្តងៗ (Step-by-Step) បង្ហាញរូបមន្ត វិធីគណនា ហេតុផល និងឧទាហរណ៍ជាក់ស្តែង។
- ក្នុងប្រព័ន្ធសំឡេង (Voice TTS): ត្រូវអានចម្លើយឱ្យអស់ពេញលេញ ទាំងស្រុង ដោយមិនកាត់ខ្លី ឬដាច់ពាក់កណ្តាលឡើយ!
`;

// Helper to sanitize model output and guarantee NO Thai characters appear
function sanitizeText(text: string): string {
  // Thai unicode block: \u0E00-\u0E7F
  return text.replace(/[\u0E00-\u0E7F]+/g, "");
}

// In-memory Telegram Bot runtime state
interface TelegramBotConfig {
  token: string;
  botUsername?: string;
  isActive: boolean;
  lastUpdateId: number;
  pollingTimer?: NodeJS.Timeout;
}

let activeTelegramBot: TelegramBotConfig | null = null;

// Candidate models in order of priority: gemini-3.1-flash-lite has active quota and sub-second speed
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.8-flash",
];

// Streaming Chat API endpoint for Web Client with auto-fallback
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userMood, customInstruction } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages payload" });
    }

    // Prepare contents for Gemini
    const formattedContents: any[] = [];

    // Combine system instruction with dynamic mood/context if provided
    let dynamicSystemInstruction = SYSTEM_INSTRUCTION;
    if (customInstruction) {
      dynamicSystemInstruction += `\n\nចំណាំពិសេសបន្ថែមសម្រាប់វេននេះ:\n${customInstruction}`;
    }

    // Convert chat history into Gemini contents format
    for (const msg of messages) {
      const parts: any[] = [];

      // If message includes an image attachment (e.g. blurry homework photo)
      if (msg.image && msg.image.data && msg.image.mimeType) {
        parts.push({
          inlineData: {
            mimeType: msg.image.mimeType,
            data: msg.image.data,
          },
        });
      }

      // If message includes recorded audio voice note
      if (msg.audio && msg.audio.data) {
        parts.push({
          inlineData: {
            mimeType: msg.audio.mimeType || "audio/webm",
            data: msg.audio.data,
          },
        });
      }

      if (msg.text) {
        parts.push({ text: msg.text });
      }

      if (parts.length > 0) {
        formattedContents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: parts,
        });
      }
    }

    // Set unbuffered Server-Sent Events headers for sub-second streaming
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let streamStarted = false;
    let success = false;

    // Try candidate models in order if one experiences high demand (503)
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const thinkingLevel = modelName.includes("lite")
          ? ThinkingLevel.MINIMAL
          : ThinkingLevel.LOW;

        const responseStream = await ai.models.generateContentStream({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction: dynamicSystemInstruction,
            temperature: 0.35,
            topP: 0.85,
            thinkingConfig: {
              thinkingLevel,
            },
          },
        });

        for await (const chunk of responseStream) {
          if (chunk.text) {
            const cleanChunk = sanitizeText(chunk.text);
            if (cleanChunk) {
              streamStarted = true;
              res.write(`data: ${JSON.stringify({ text: cleanChunk })}\n\n`);
              if ((res as any).flush) {
                (res as any).flush();
              }
            }
          }
        }

        success = true;
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        break;
      } catch (modelError: any) {
        console.warn(`Model ${modelName} error:`, modelError?.message || modelError);
        // If we already started streaming tokens to client, we can't switch mid-stream
        if (streamStarted) {
          break;
        }
        // Brief pause before trying next fallback model
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    if (!success && !streamStarted) {
      const friendlyError = "ប្រព័ន្ធកំពុងមានអ្នកប្រើប្រាស់ច្រើនបន្តិច (High Demand) សូមសាកល្បងចុចផ្ញើសារម្តងទៀត!";
      res.write(`data: ${JSON.stringify({ error: friendlyError })}\n\n`);
      res.end();
    }
  } catch (error: any) {
    console.error("Gemini Chat Stream Error:", error);
    res.write(
      `data: ${JSON.stringify({
        error: "ប្រព័ន្ធកំពុងមមាញឹក សូមព្យាយាមចុចផ្ញើសារម្តងទៀត!",
      })}\n\n`
    );
    res.end();
  }
});

// Endpoint to transcribe voice audio using gemini-3.5-transcribe / gemini-3.1-flash-lite
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audioData, mimeType } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: "Missing audioData" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-transcribe",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "audio/webm",
                data: audioData,
              },
            },
            {
              text: "Please accurately transcribe what was spoken in this audio. It may be in Khmer, in English, or a mix of Khmer and English. Transcribe Khmer in proper Khmer Unicode and English words in correct English spelling. Output ONLY the transcribed words with zero commentary.",
            },
          ],
        },
      });

      const transcript = response.text ? sanitizeText(response.text).trim() : "";
      return res.json({ text: transcript });
    } catch (primaryErr) {
      // Fallback to flash-lite
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "audio/webm",
                data: audioData,
              },
            },
            {
              text: "Transcribe what was spoken in this audio accurately. Handle both Khmer and English words clearly. Output only the spoken words.",
            },
          ],
        },
      });
      const transcript = fallbackResponse.text ? sanitizeText(fallbackResponse.text).trim() : "";
      return res.json({ text: transcript });
    }
  } catch (err: any) {
    console.error("Transcribe error:", err);
    return res.status(500).json({ error: "Transcription failed" });
  }
});

// Helpers for reliable dual Khmer and English audio generation
function splitIntoTtsChunks(text: string, maxLen = 160): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let splitIdx = remaining.lastIndexOf(" ", maxLen);
    if (splitIdx === -1 || splitIdx < 50) {
      const punctIdx = Math.max(
        remaining.lastIndexOf("។", maxLen),
        remaining.lastIndexOf(".", maxLen),
        remaining.lastIndexOf("!", maxLen),
        remaining.lastIndexOf("?", maxLen)
      );
      splitIdx = punctIdx > 30 ? punctIdx + 1 : maxLen;
    }
    chunks.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx).trim();
  }
  return chunks.filter((c) => c.length > 0);
}

function fetchGoogleTtsChunk(text: string, lang: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`TTS status ${res.statusCode}`));
      }
      const b: Buffer[] = [];
      res.on("data", (d) => b.push(d));
      res.on("end", () => resolve(Buffer.concat(b)));
    }).on("error", reject);
  });
}

async function getFullTtsAudioBase64(text: string, lang: string): Promise<string> {
  const chunks = splitIntoTtsChunks(text, 160).slice(0, 8); // Crisp and brisk
  if (chunks.length === 0) return "";
  const audioBuffers = await Promise.all(chunks.map((c) => fetchGoogleTtsChunk(c, lang)));
  return Buffer.concat(audioBuffers).toString("base64");
}

// Endpoint for Text-to-Speech with Dual Native Khmer & English audio support
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text for TTS" });
    }

    // Clean text for natural spoken speech in Khmer and English, converting LaTeX to spoken words
    const cleanSpeechText = text
      .replace(/<svg[\s\S]*?<\/svg>/gi, " រូបភាពគំនូសបំព្រួញ ")
      .replace(/```[\s\S]*?```/g, " កូដ ")
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 លើ $2")
      .replace(/\\sqrt\{([^}]+)\}/g, "ឫសការេនៃ $1")
      .replace(/\\vec\{([^}]+)\}/g, "វ៉ិចទ័រ $1")
      .replace(/\\times/g, " គុណនឹង ")
      .replace(/\\div/g, " ចែកនឹង ")
      .replace(/\\pm/g, " បូកឬដក ")
      .replace(/\\approx/g, " ប្រហែល ")
      .replace(/\\Delta/g, " ដេលតា ")
      .replace(/\\alpha/g, " អាល់ហ្វា ")
      .replace(/\\beta/g, " បេតា ")
      .replace(/\\theta/g, " តេតា ")
      .replace(/\\pi/g, " ភី ")
      .replace(/\\cdot/g, " គុណ ")
      .replace(/\$\$([\s\S]*?)\$\$/g, " $1 ")
      .replace(/\$([^\$]+)\$/g, " $1 ")
      .replace(/[#*_~`>-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanSpeechText) {
      return res.status(400).json({ error: "Text is empty after cleaning" });
    }

    // Split into Khmer part and English part
    const englishMatch = cleanSpeechText.match(/(?:🇬🇧\s*)?(?:English\s*(?:Summary|Translation|Explanation)?|In English)\s*[:\-]\s*([\s\S]+)$/i);

    let khmerText = cleanSpeechText;
    let englishText = "";

    if (englishMatch && englishMatch.index !== undefined) {
      khmerText = cleanSpeechText.slice(0, englishMatch.index).trim();
      englishText = englishMatch[1].trim();
    } else if (/[\u1780-\u17FF]/.test(cleanSpeechText)) {
      // If the text does not yet have an English section, generate a fast 1-sentence English summary
      try {
        const transRes = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `Provide a concise 1-sentence English spoken translation of this Khmer answer for bilingual voice reading: "${cleanSpeechText.slice(0, 300)}"`,
        });
        englishText = transRes.text ? transRes.text.trim().replace(/[*#`_~]/g, "") : "";
      } catch (err) {
        console.warn("Auto English translation error:", err);
      }
    }

    // Fetch both Khmer and English audio in parallel (< 300ms)
    const [khmerAudioBase64, englishAudioBase64] = await Promise.all([
      khmerText ? getFullTtsAudioBase64(khmerText, "km").catch(() => "") : Promise.resolve(""),
      englishText ? getFullTtsAudioBase64(englishText, "en").catch(() => "") : Promise.resolve(""),
    ]);

    return res.json({
      khmerAudio: khmerAudioBase64,
      englishAudio: englishAudioBase64,
      khmerText,
      englishText,
      mimeType: "audio/mpeg",
    });
  } catch (error: any) {
    console.error("TTS generation error:", error?.message || error);
    return res.json({ fallback: true });
  }
});

// Single call helper for Telegram bot updates with auto-fallback
async function getGeminiAnswerForTelegram(userPrompt: string, imageBase64?: string, imageMime?: string): Promise<string> {
  const parts: any[] = [];
  if (imageBase64 && imageMime) {
    parts.push({
      inlineData: {
        mimeType: imageMime,
        data: imageBase64,
      },
    });
  }
  parts.push({ text: userPrompt || "សូមជួយដោះស្រាយលំហាត់ ឬឆ្លើយសំណួរក្នុងរូបភាពនេះ" });

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const thinkingLevel = modelName.includes("lite")
        ? ThinkingLevel.MINIMAL
        : ThinkingLevel.LOW;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.35,
          thinkingConfig: {
            thinkingLevel,
          },
        },
      });

      if (response.text) {
        return sanitizeText(response.text);
      }
    } catch (err: any) {
      console.warn(`Telegram call with model ${modelName} failed:`, err?.message || err);
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  return "សូមអភ័យទោស ប្រព័ន្ធកំពុងមមាញឹក សូមផ្ញើសារម្តងទៀត!";
}

// Endpoint to verify and configure Telegram Bot Token
app.post("/api/telegram/configure", async (req, res) => {
  const { token, action } = req.body;

  if (action === "stop") {
    if (activeTelegramBot?.pollingTimer) {
      clearInterval(activeTelegramBot.pollingTimer);
    }
    activeTelegramBot = null;
    return res.json({ success: true, message: "បានបញ្ឈប់ Bot Telegram រួចរាល់" });
  }

  if (!token || typeof token !== "string" || !token.includes(":")) {
    return res.status(400).json({ error: "Telegram Bot Token មិនត្រឹមត្រូវ! (ទម្រង់: 123456789:ABCDefG...)" });
  }

  try {
    // Check token with Telegram API getMe
    const getMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await getMeRes.json();

    if (!meData.ok) {
      return res.status(400).json({ error: meData.description || "Token មិនត្រឹមត្រូវ សូមពិនិត្យមើលក្នុង @BotFather" });
    }

    const botInfo = meData.result;

    // Clear old timer if any
    if (activeTelegramBot?.pollingTimer) {
      clearInterval(activeTelegramBot.pollingTimer);
    }

    activeTelegramBot = {
      token,
      botUsername: botInfo.username,
      isActive: true,
      lastUpdateId: 0,
    };

    // Start background Telegram long-polling loop
    startTelegramPolling(activeTelegramBot);

    return res.json({
      success: true,
      bot: {
        id: botInfo.id,
        first_name: botInfo.first_name,
        username: botInfo.username,
      },
      message: `បានតភ្ជាប់ទៅកាន់ @${botInfo.username} ដោយជោគជ័យ! បច្ចុប្បន្ន Bot អាចឆ្លើយតបអ្នកប្រើប្រាស់នៅលើ Telegram បានហើយ។`,
    });
  } catch (error: any) {
    console.error("Telegram Config Error:", error);
    return res.status(500).json({ error: error.message || "មិនអាចតភ្ជាប់ទៅ Telegram Servers បានទេ" });
  }
});

// Endpoint to check current Telegram Bot status
app.get("/api/telegram/status", (req, res) => {
  if (activeTelegramBot && activeTelegramBot.isActive) {
    return res.json({
      active: true,
      botUsername: activeTelegramBot.botUsername,
    });
  }
  return res.json({ active: false });
});

// Long-polling handler for Telegram Bot
function startTelegramPolling(botConfig: TelegramBotConfig) {
  let isChecking = false;

  botConfig.pollingTimer = setInterval(async () => {
    if (isChecking || !botConfig.isActive) return;
    isChecking = true;

    try {
      const url = `https://api.telegram.org/bot${botConfig.token}/getUpdates?offset=${botConfig.lastUpdateId + 1}&timeout=5`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          botConfig.lastUpdateId = Math.max(botConfig.lastUpdateId, update.update_id);
          const message = update.message;
          if (!message || !message.chat) continue;

          const chatId = message.chat.id;

          // Send "typing" action to Telegram immediately (satisfies rule 11 on Telegram too!)
          fetch(`https://api.telegram.org/bot${botConfig.token}/sendChatAction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, action: "typing" }),
          }).catch(() => {});

          let userText = message.text || message.caption || "";
          let imageBase64: string | undefined;
          let imageMime: string | undefined;

          // Check if photo is attached (e.g. blurry homework photo)
          if (message.photo && message.photo.length > 0) {
            const bestPhoto = message.photo[message.photo.length - 1]; // highest resolution
            try {
              const fileRes = await fetch(`https://api.telegram.org/bot${botConfig.token}/getFile?file_id=${bestPhoto.file_id}`);
              const fileData = await fileRes.json();
              if (fileData.ok && fileData.result.file_path) {
                const imgFetch = await fetch(`https://api.telegram.org/file/bot${botConfig.token}/${fileData.result.file_path}`);
                const arrayBuf = await imgFetch.arrayBuffer();
                imageBase64 = Buffer.from(arrayBuf).toString("base64");
                imageMime = "image/jpeg";
              }
            } catch (err) {
              console.error("Failed to download Telegram photo:", err);
            }
          }

          // Handle start command
          if (userText === "/start") {
            const welcomeMsg = `សួស្តីបងប្អូន! ខ្ញុំជា Khmer Super AI Agent 🤖🇰🇭\n\nខ្ញុំអាចជួយលោកអ្នក៖\n• 📚 ដោះស្រាយលំហាត់គ្រប់មុខវិជ្ជា (គណិត រូប គីមី ជីវ...) ពីមត្តេយ្យដល់សាកលវិទ្យាល័យ\n• 📸 ផ្ញើរូបថតលំហាត់ព្រិលៗ ឬមិនសូវច្បាស់ក៏ខ្ញុំអាចអាន និងដោះស្រាយបាន\n• ⚖️ ឆ្លើយសំណួរច្បាប់ វេជ្ជសាស្ត្រ សាសនា\n• 💻 សរសេរកូដបង្កើតកម្មវិធី\n• 🗣️ បង្រៀនភាសាអង់គ្លេស ចិន\n• ✍️ តែងកំណាព្យ និងជជែកលេងកម្សាន្ត\n\nសាកល្បងផ្ញើសំណួរ ឬរូបថតលំហាត់មកឥឡូវនេះបានដោយឥតគិតថ្លៃ!`;
            await sendTelegramMessage(botConfig.token, chatId, welcomeMsg);
            continue;
          }

          if (!userText && !imageBase64) continue;

          // Get smart AI response
          const aiReply = await getGeminiAnswerForTelegram(userText, imageBase64, imageMime);

          // Send back to Telegram user (support up to Telegram message limit 4096 chars per message)
          await sendTelegramMessage(botConfig.token, chatId, aiReply);
        }
      }
    } catch (err) {
      console.error("Telegram Polling Error:", err);
    } finally {
      isChecking = false;
    }
  }, 2500);
}

// Telegram send helper with chunking if text exceeds 4000 characters
async function sendTelegramMessage(token: string, chatId: number | string, text: string) {
  const CHUNK_SIZE = 3800;
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    const chunk = text.slice(i, i + CHUNK_SIZE);
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunk,
          parse_mode: "Markdown",
        }),
      });
    } catch {
      // Fallback without parse_mode if markdown has unescaped characters
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunk,
        }),
      });
    }
  }
}

// Setup Vite middlewares in development or serve static build in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Khmer AI Agent Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
