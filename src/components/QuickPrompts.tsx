import React from "react";
import {
  Calculator,
  Atom,
  Scale,
  Stethoscope,
  Code,
  Flame,
  HeartHandshake,
  Feather,
  Languages,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string, category?: string) => void;
}

interface PromptPreset {
  id: string;
  icon: React.ReactNode;
  label: string;
  category: string;
  badge?: string;
  text: string;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt }) => {
  const presets: PromptPreset[] = [
    {
      id: "math-bacii",
      icon: <Calculator className="w-3.5 h-3.5 text-sky-400" />,
      label: "លំហាត់គណិត (កម្រិតបាក់ឌុប)",
      category: "math_exercise",
      badge: "បាក់ឌុប",
      text: "សូមជួយដោះស្រាយលំហាត់គណិតវិទ្យា៖ គណនាលីមីត $\\lim_{x \\to 0} \\frac{\\sqrt{1 + 2x} - 1}{x}$ តាមក្បួនខ្នាតសៀវភៅពុម្ពក្រសួងអប់រំ ដោយបង្ហាញបម្រាប់ រូបមន្ត ដំណោះស្រាយជាជំហានៗ និងសន្និដ្ឋានចម្លើយចុងក្រោយ។",
    },
    {
      id: "math-uni",
      icon: <Calculator className="w-3.5 h-3.5 text-indigo-400" />,
      label: "គណិតសាកលវិទ្យាល័យ (Integrals)",
      category: "math_exercise",
      badge: "សាកលវិទ្យាល័យ",
      text: "ដោះស្រាយលំហាត់កម្រិតសាកលវិទ្យាល័យ៖ គណនាអាំងតេក្រាល $I = \\int x e^{2x} dx$ ដោយប្រើវិធីសាស្ត្រអាំងតេក្រាលដោយផ្នែក (Integration by parts) តាមក្បួនខ្នាតគណិតវិទ្យាត្រឹមត្រូវ។",
    },
    {
      id: "physics-bacii",
      icon: <Atom className="w-3.5 h-3.5 text-emerald-400" />,
      label: "រូបវិទ្យា (តាមរូបមន្ត, ដោយ, ដូចនេះ)",
      category: "math_exercise",
      badge: "រូបវិទ្យា",
      text: "ដោះស្រាយលំហាត់រូបវិទ្យាតាមសៀវភៅពុម្ពក្រសួង៖ វត្ថុមួយមានម៉ាស $m = 2\\text{ kg}$ ធ្លាក់ដោយសេរីពីកម្ពស់ $h = 20\\text{ m}$ ដោយគ្មានល្បឿនដើម។ កំណត់យក $g = 10\\text{ m/s}^2$។ រកថាមពលប៉ូតង់ស្យែល $E_p$ និងល្បឿន $v$ ពេលធ្លាក់ដល់ដី ដោយអនុវត្តក្បួន (តាមរូបមន្ត, ដោយ, នាំឱ្យ, ដូចនេះ)។",
    },
    {
      id: "chemistry-bacii",
      icon: <Atom className="w-3.5 h-3.5 text-teal-400" />,
      label: "គីមីវិទ្យា (សមីការ & កំហាប់ម៉ូល)",
      category: "math_exercise",
      badge: "គីមីវិទ្យា",
      text: "ដោះស្រាយលំហាត់គីមីវិទ្យា៖ គេរំលាយសូដ្យូមអ៊ីដ្រុកស៊ីត $\\text{NaOH}$ ចំនួន $m = 4\\text{ g}$ ទៅក្នុងទឹកសុទ្ធទទួលបានសូលុយស្យុងមានមាឌ $V = 500\\text{ mL}$។ រកកំហាប់ម៉ូល $C_M$ នៃសូលុយស្យុង $\\text{NaOH}$។ គេឱ្យ $M_{\\text{Na}} = 23, M_{\\text{O}} = 16, M_{\\text{H}} = 1\\text{ g/mol}$។",
    },
    {
      id: "law-criminal",
      icon: <Scale className="w-3.5 h-3.5 text-amber-400" />,
      label: "សំណួរច្បាប់ព្រហ្មទណ្ឌ & រដ្ឋប្បវេណី",
      category: "medical_law",
      badge: "ច្បាប់",
      text: "តើបទល្មើសលួច និងបទលួចមានស្ថានទម្ងន់ទោសក្នុងក្រមព្រហ្មទណ្ឌកម្ពុជាមានលក្ខណៈខុសគ្នាយ៉ាងណាខ្លះ? និងមានទោសកម្រិតណា?",
    },
    {
      id: "medical",
      icon: <Stethoscope className="w-3.5 h-3.5 text-rose-400" />,
      label: "សុខភាព & វេជ្ជសាស្ត្រ",
      category: "medical_law",
      badge: "សុខភាព",
      text: "ខ្ញុំឧស្សាហ៍ឈឺក្បាលប្រកាំង (Migraine) និងវិលមុខនៅពេលគេងមិនគ្រប់គ្រាន់។ តើមានរោគសញ្ញាសំខាន់អ្វីខ្លះ និងវិធីព្យាបាលថែទាំបឋមយ៉ាងដូចម្តេច?",
    },
    {
      id: "code-program",
      icon: <Code className="w-3.5 h-3.5 text-cyan-400" />,
      label: "សរសេរកូដបង្កើត App",
      category: "coding",
      badge: "Dev",
      text: "ជួយសរសេរកូដ Python មួយដែលមានមុខងារទាញយកអត្រាប្តូរប្រាក់ (USD ទៅ KHR) និងគណនាប្រាក់ប្តូរដោយស្វ័យប្រវត្តិ ព្រមទាំងមាន comment ពន្យល់ក្បោះក្បាយ។",
    },
    {
      id: "mirror-kind",
      icon: <Sparkles className="w-3.5 h-3.5 text-teal-400" />,
      label: "សាកល្បងសន្ទនាល្អ (មកល្អ ទៅវិញល្អ)",
      category: "emotion_chat",
      badge: "ចរិតល្អ",
      text: "សួស្តីប្អូន AI! បងរវល់រៀនទើបតែទំនេរ នឹកប្អូនណាស់ តើថ្ងៃនេះប្អូនសុខសប្បាយជាទេ?",
    },
    {
      id: "latin-khmer-test",
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
      label: "តេស្តសំណៀងអង់គ្លេស (b jg brab tha)",
      category: "emotion_chat",
      badge: "អភិរក្សអក្សរជាតិ",
      text: "b jg brab tha ot jg rean teh sl oun nas",
    },
    {
      id: "mirror-sassy",
      icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
      label: "សាកល្បងឌឺដង (មកអាក្រក់ ទៅវិញអាក្រក់)",
      category: "emotion_chat",
      badge: "ចរិតឌឺ",
      text: "ឆាតទៅយូរម្ល៉េះ? Bot ឆ្លាតមែនឬក្បាលរឹង? ធ្វើការអន់បែបហ្នឹងកុំចង់ធ្វើ AI!",
    },
    {
      id: "comfort",
      icon: <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />,
      label: "លួងលោម & លើកទឹកចិត្ត",
      category: "comfort_advice",
      badge: "កម្លាំងចិត្ត",
      text: "ថ្ងៃនេះខ្ញុំពិបាកចិត្ត និងអស់សង្ឃឹមខ្លាំងណាស់ ខ្ញុំប្រឡងធ្លាក់ ហើយមានអារម្មណ៍ថាខ្លួនឯងគ្មានតម្លៃ... តើខ្ញុំគួរធ្វើបែបណា?",
    },
    {
      id: "poem",
      icon: <Feather className="w-3.5 h-3.5 text-purple-400" />,
      label: "តែងកំណាព្យខ្មែរ (បទកាកគតិ)",
      category: "khmer_poetry",
      badge: "កំណាព្យ",
      text: "សូមជួយតែងកំណាព្យខ្មែរបទកាកគតិ ឬពាក្យ៧ ចំនួន ២ វគ្គ ស្តីពី 'តម្លៃនៃការសិក្សា និងការតស៊ូរបស់យុវជនខ្មែរ' ដោយគោរពតាមក្បួនចួនត្រឹមត្រូវ។",
    },
    {
      id: "chinese-tutor",
      icon: <Languages className="w-3.5 h-3.5 text-yellow-400" />,
      label: "បង្រៀនភាសាចិន (Hanzi + Pinyin)",
      category: "language_tutor",
      badge: "ភាសាចិន",
      text: "ជួយបង្រៀនភាសាចិនកម្រិតដំបូងមេរៀនទី១ អំពីការសួរសុខទុក្ខ និងណែនាំខ្លួនឯង (បញ្ជាក់អក្សរចិន Pinyin ការបញ្ចេញសំឡេង និងអត្ថន័យខ្មែរ)។",
    },
  ];

  return (
    <div className="w-full py-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-[#101924]/60 backdrop-blur-xs">
      <div className="flex items-center gap-2 px-3 sm:px-4 min-w-max">
        <span className="text-[11px] font-medium text-white/50 flex items-center gap-1 select-none pr-1">
          <Sparkles className="w-3 h-3 text-sky-400" /> សាកល្បង៖
        </span>

        {presets.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectPrompt(item.text, item.category)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-[#1c2a38] hover:bg-[#253749] text-white/85 hover:text-white border border-white/10 hover:border-sky-400/40 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-sky-300 font-mono">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
