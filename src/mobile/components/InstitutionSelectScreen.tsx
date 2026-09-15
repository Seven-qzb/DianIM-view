import React, { useState } from 'react';
import { Institution } from '../types';
import { ShieldCheck, ChevronLeft, Building2, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface InstitutionSelectScreenProps {
  institutions: Institution[];
  currentInstitutionId: string;
  onSelectInstitution: (institution: Institution) => void;
  onBack?: () => void;
}

export const InstitutionSelectScreen: React.FC<InstitutionSelectScreenProps> = ({
  institutions,
  currentInstitutionId,
  onSelectInstitution,
}) => {
  const [selectedId, setSelectedId] = useState<string>(currentInstitutionId || institutions[0]?.id);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleConfirm = () => {
    const target = institutions.find((inst) => inst.id === selectedId);
    if (!target) {
      setErrorNotice('请选择您所属的机构');
      return;
    }
    if (target.disabled) {
      setErrorNotice(`机构 [${target.name}] 已被管理员禁用或处于测试隔离状态`);
      return;
    }
    setErrorNotice(null);
    onSelectInstitution(target);
  };

  return (
    <div className="h-full bg-[#F8F9FA] text-slate-900 flex flex-col justify-between max-w-[430px] w-full mx-auto relative select-none font-sans overflow-y-auto no-scrollbar">
      {/* Main Selection Body */}
      <main className="flex-1 flex flex-col px-5 pt-8 pb-6 justify-center">
        {/* Title Section */}
        <section className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="font-bold text-2xl text-slate-900 mb-1.5">
              请选择机构
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              选择所应用群组的机构
            </p>
          </motion.div>
        </section>

        {/* Institution Cards Section */}
        <section className="flex-1 flex flex-col justify-center">
          <div className="flex flex-col gap-3" id="institutionForm">
            {institutions.map((inst, idx) => {
              const isSelected = selectedId === inst.id;
              const isDisabled = inst.disabled;

              return (
                <motion.div
                  key={inst.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                  className="relative"
                >
                  <label
                    htmlFor={`inst-${inst.id}`}
                    onClick={() => {
                      setSelectedId(inst.id);
                      if (inst.disabled) {
                        setErrorNotice('此机构为测试禁用机构，请选择正式机构');
                      } else {
                        setErrorNotice(null);
                      }
                    }}
                    className={`block w-full p-4 rounded-xl cursor-pointer transition-all duration-200 text-center flex items-center justify-center min-h-[64px] relative border ${
                      isSelected
                        ? 'border-[#0058BD] bg-blue-50/40 shadow-xs ring-1 ring-[#0058BD]'
                        : 'border-slate-200 bg-white hover:bg-slate-50 shadow-xs'
                    } ${isDisabled ? 'opacity-60' : ''}`}
                  >
                    <input
                      id={`inst-${inst.id}`}
                      type="radio"
                      name="institution"
                      value={inst.id}
                      checked={isSelected}
                      onChange={() => setSelectedId(inst.id)}
                      className="sr-only"
                    />
                    
                    <span className={`font-medium text-sm leading-relaxed px-4 text-center ${
                      isSelected ? 'text-[#0058BD] font-semibold' : 'text-slate-800'
                    }`}>
                      {inst.name}
                    </span>

                    {/* Selected badge */}
                    {isSelected && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#0058BD] text-white rounded-full flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </label>
                </motion.div>
              );
            })}
          </div>

          {/* Error Notice */}
          {errorNotice && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{errorNotice}</span>
            </motion.div>
          )}
        </section>
      </main>

      {/* Bottom Fixed Action Button */}
      <footer className="w-full px-5 py-6 bg-transparent flex justify-center">
        <button
          id="confirm-institution-btn"
          type="button"
          onClick={handleConfirm}
          className="w-full h-12 bg-[#0058BD] text-white font-semibold text-sm rounded-xl hover:bg-[#004CB3] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center cursor-pointer"
        >
          确定进入
        </button>
      </footer>
    </div>
  );
};
