import React from 'react';
import { Sparkles, Heart, Feather, Compass, Users, MapPin, Coffee, MessageCircle } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export default function AboutPage({ onExploreMeetup }) {
  const { aboutContent, siteConfig } = useContent();
  const valueIcons = [
    <Feather className="w-6 h-6 text-olive-700" />,
    <Heart className="w-6 h-6 text-olive-700" />,
    <Compass className="w-6 h-6 text-olive-700" />,
    <Users className="w-6 h-6 text-olive-700" />,
  ];

  return (
    <div className="py-12 bg-[#FAF7F0] min-h-screen space-y-16">
      
      {/* Hero Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-olive-100 text-olive-800 text-xs font-semibold">
          <Sparkles size={14} />
          <span>فلسفه و آرمان ما</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#222D42] tracking-tight leading-tight">
          {aboutContent.heroTitle}
        </h1>

        <p className="text-base sm:text-xl text-[#5F6B7A] font-light max-w-3xl mx-auto leading-relaxed">
          {aboutContent.heroSubtitle}
        </p>

        <div className="w-24 h-1 bg-olive-600 mx-auto rounded-full mt-6"></div>
      </section>

      {/* Main Philosophy Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#E7E3D8] p-8 sm:p-12 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-olive-50 rounded-2xl text-olive-700">
              <Coffee size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[#222D42]">
              {aboutContent.philosophy.title}
            </h2>
          </div>

          <div className="text-sm sm:text-base text-[#4A5568] leading-loose space-y-4 font-light">
            <p>{aboutContent.philosophy.p1}</p>
            <p>{aboutContent.philosophy.p2}</p>
          </div>
        </div>
      </section>

      {/* 4 Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222D42]">
            ارزش‌های بنیادین در «دَمی برای زیستن»
          </h2>
          <p className="text-xs sm:text-sm text-[#707A65]">
            آنچه در هر جلسه و گردهمایی پاس می‌داریم
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aboutContent.values.map((val, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl border border-[#E7E3D8] p-7 shadow-sm hover:shadow-md hover:border-olive-400 transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-olive-50 flex items-center justify-center">
                {valueIcons[index % valueIcons.length]}
              </div>
              <h3 className="text-lg font-bold text-[#222D42]">
                {val.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#5F6B7A] leading-relaxed font-light">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team band — olive identity strip */}
      {aboutContent.team?.members?.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#4A622E] text-white rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                  <Users size={13} />
                  <span>همراهان اصلی</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  {aboutContent.team.title}
                </h2>
                {aboutContent.team.subtitle && (
                  <p className="text-xs sm:text-sm text-olive-50 font-light max-w-xl mx-auto leading-relaxed">
                    {aboutContent.team.subtitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {aboutContent.team.members.map((member) => {
                  const initials = (member.name || '')
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0] || '')
                    .join('');

                  return (
                    <article
                      key={member.id || member.name}
                      className="bg-[#FAF7F0] text-[#222D42] rounded-3xl border border-white/20 p-5 sm:p-6 shadow-sm flex flex-col gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-[#E7E3D8] bg-olive-100 flex items-center justify-center shrink-0">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name || ''}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : initials ? (
                            <span className="text-base font-bold text-olive-800">
                              {initials}
                            </span>
                          ) : (
                            <Users size={20} className="text-olive-700" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <h3 className="text-base sm:text-lg font-bold truncate">
                            {member.name}
                          </h3>
                          {member.role && (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full bg-olive-100 text-olive-800 text-[11px] font-semibold">
                              {member.role}
                            </span>
                          )}
                        </div>
                      </div>

                      {member.bio && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold text-olive-800">درباره</p>
                          <p className="text-xs sm:text-sm text-[#5F6B7A] leading-relaxed font-light">
                            {member.bio}
                          </p>
                        </div>
                      )}

                      {member.work && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold text-olive-800">کار در تیم</p>
                          <p className="text-xs sm:text-sm text-[#5F6B7A] leading-relaxed font-light">
                            {member.work}
                          </p>
                        </div>
                      )}

                      {member.contact && (
                        <div className="mt-auto pt-3 border-t border-[#E7E3D8]/80 flex items-center gap-2 text-xs text-navy-800">
                          <MessageCircle size={14} className="text-olive-700 shrink-0" />
                          <span className="dir-ltr text-right break-all">{member.contact}</span>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Kerman & Banu Hayati Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#4A622E] text-white rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
              <MapPin size={13} />
              <span>ریشه‌ها در کرمان</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold">
              {aboutContent.kermanStory.title}
            </h2>

            <p className="text-xs sm:text-sm text-olive-50 leading-loose font-light">
              {aboutContent.kermanStory.desc}
            </p>

            <div className="pt-4">
              <button
                onClick={onExploreMeetup}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-olive-900 font-semibold text-xs hover:bg-olive-50 transition-colors shadow-sm"
              >
                <span>مشاهده مشخصات دورهمی پیش‌رو</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
