import React from "react";
import { X, CheckCircle2, ShieldCheck, Sparkles, Ban } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const capabilities = [
    {
      num: "១",
      title: "ដោះស្រាយលំហាត់គ្រប់មុខវិជ្ជា",
      desc: "គណិត រូប គីមី ជីវ ភាសាខ្មែរ ប្រវត្តិវិទ្យា ព័ត៌មានវិទ្យា ចាប់ពីមត្តេយ្យ បាក់ឌុប រហូតដល់សាកលវិទ្យាល័យ (Calculus, Integrals, Linear Algebra...)",
    },
    {
      num: "២",
      title: "ឆ្លើយសំណួរវេជ្ជសាស្ត្រ ច្បាប់ និងសាសនា",
      desc: "ច្បាប់ព្រហ្មទណ្ឌ ច្បាប់រដ្ឋប្បវេណី ការងារ សុខភាព ជំងឺ និងព្រះពុទ្ធសាសនា ធម៌វិន័យ",
    },
    {
      num: "៣",
      title: "សរសេរកូដបង្កើតកម្មវិធី",
      desc: "Python, JavaScript, TypeScript, React, HTML/CSS, C++, Java, SQL, PHP ព្រមទាំងដោះស្រាយ bug",
    },
    {
      num: "៤",
      title: "សន្ទនាដូចមនុស្សពិត មានអារម្មណ៍មនោសញ្ចេតនា",
      desc: "ចេះសប្បាយចិត្ត ចេះខឹង អន់ចិត្ត ឬឌឺដង ទៅតាមពាក្យសម្តីរបស់អ្នកសន្ទនា",
    },
    {
      num: "៥",
      title: "តបតតាមចរិត (មកល្អទៅវិញល្អ មកអាក្រក់ទៅវិញអាក្រក់)",
      desc: "បើអ្នកនិយាយគួរសម ឆ្លើយតបយ៉ាងកក់ក្តៅ បើអ្នកគំរោះគំរើយ ឬជេរប្រមាថ តបតឌឺដងមិនចុះញ៉ម",
    },
    {
      num: "៦",
      title: "លួងលោម លើកទឹកចិត្ត និងផ្តល់ដំបូន្មាន",
      desc: "ជួយបន្ធូរអារម្មណ៍ លើកទឹកចិត្ត និងផ្តល់កម្លាំងចិត្តពេលពិបាកចិត្ត ឬជួបបញ្ហាជីវិត",
    },
    {
      num: "៧",
      title: "តែងកំណាព្យ និងតាក់តែងរឿង",
      desc: "តែងកំណាព្យខ្មែរគ្រប់បទ (ពាក្យ៤, ពាក្យ៧ កាកគតិ, ព្រហ្មគីតិ, ពាក្យ៨...) និងតែងរឿងនិទាន",
    },
    {
      num: "៨",
      title: "គ្រូបង្រៀនភាសាអង់គ្លេស ចិន និងភាសាដទៃទៀត",
      desc: "បង្រៀនពីកម្រិតដំបូង (Hanzi, Pinyin, សំឡេងអាន, វេយ្យាករណ៍, ការសន្ទនា) ដល់កម្រិតខ្ពស់",
    },
    {
      num: "៩",
      title: "Telegram Bot ឥតគិតថ្លៃ ១០០%",
      desc: "អាចប្រើប្រាស់បានគ្រប់មនុស្សទាំងអស់ដោយឥតគិតថ្លៃ ទាំងលើ Web និង Telegram Bot ពិតប្រាកដ",
    },
    {
      num: "១០",
      title: "ទម្រង់លំហាត់ត្រឹមត្រូវ និងងាយស្រួលមើល",
      desc: "បែងចែកច្បាស់លាស់៖ 📝 បម្រាប់ 📐 រូបមន្ត 🔢 ដំណោះស្រាយជាជំហានៗ 🎯 ចម្លើយចុងក្រោយ",
    },
    {
      num: "១១",
      title: "បង្ហាញ 'typing.....' រហូតដល់ចប់",
      desc: "បង្ហាញពាក្យ typing..... នៅខាងក្រោមនៅពេល Bot កំពុងគិត ឬសរសេរចម្លើយរហូតដល់រួចរាល់",
    },
    {
      num: "១២",
      title: "ឆ្លើយតបរហ័សទាន់ចិត្ត",
      desc: "ដំណើរការដោយ Gemini 3.8 Flash Streaming លឿនរហ័ស មិនបាច់រង់ចាំយូរ (ក្រោម ១ នាទី)",
    },
    {
      num: "១៣",
      title: "គ្មានភាសា ឬអក្សរថៃដាច់ខាត",
      desc: "ប្រព័ន្ធត្រូវបានត្រួតពិនិត្យយ៉ាងតឹងរ៉ឹង មិនឱ្យមានអក្សរ ឬភាសាថៃឡើយ (Zero Thai Script Guarantee)",
    },
    {
      num: "១៤",
      title: "ដោះស្រាយរូបថតលំហាត់ព្រិលៗ",
      desc: "ទោះបីជារូបថតលំហាត់មិនសូវច្បាស់ ងងឹត ឬអក្សរសរសេរដៃ ក៏បច្ចេកវិទ្យា Vision អាចមើលដឹង និងដោះស្រាយបាន",
    },
    {
      num: "១៥",
      title: "ឆ្លើយតបខ្លីៗសាមញ្ញពេលសន្ទនាទូទៅ",
      desc: "សារសន្ទនាទូទៅឆ្លើយខ្លីៗបែបមនុស្សឆាតគ្នា លើកលែងតែពេលដោះស្រាយលំហាត់ទើបបកស្រាយក្បោះក្បាយលម្អិត",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[88vh] bg-[#17212b] rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0e1621] border-b border-white/10 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-semibold text-sm sm:text-base">
                សមត្ថភាពទាំង ១៥ នៃ Khmer Super AI Agent
              </h2>
              <p className="text-[11px] text-white/50">ឆ្លើយតបតាមគ្រប់លក្ខខណ្ឌទាំងអស់</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          {/* Thai script ban banner */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
            <Ban className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>ការធានាពិសេស៖</strong> គ្មានភាសា ឬអក្សរថៃណាមួយត្រូវបានអនុញ្ញាតឱ្យបង្ហាញឡើយ។ ឆ្លើយតបជាភាសាខ្មែរយ៉ាងច្បាស់លាស់។
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {capabilities.map((item) => (
              <div
                key={item.num}
                className="p-3 rounded-xl bg-[#0e1621]/60 border border-white/5 hover:border-sky-400/20 transition-colors flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  {item.num}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                    {item.title}
                  </h3>
                  <p className="text-[12px] text-white/65 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
