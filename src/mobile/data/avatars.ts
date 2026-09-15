// High-definition, pixel-perfect crisp avatar assets
// Matching the 13 members and user in the PointIM / MiXin design screenshots

export const AVATARS = {
  // 戚中彪 (群主) - Handsome young man, neat dark hair, black t-shirt, sharp clean portrait
  qizhongbiao: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <defs>
      <linearGradient id='bgQ' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='%23334155'/>
        <stop offset='100%' stop-color='%230f172a'/>
      </linearGradient>
      <linearGradient id='skinQ' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='%23ffd7ba'/>
        <stop offset='100%' stop-color='%23fbc4ab'/>
      </linearGradient>
      <linearGradient id='shirtQ' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='%231e293b'/>
        <stop offset='100%' stop-color='%23090d16'/>
      </linearGradient>
    </defs>
    <rect width='160' height='160' rx='28' fill='url(%23bgQ)'/>
    <!-- Body & Black T-shirt -->
    <path d='M25 160 C25 125 45 115 80 115 C115 115 135 125 135 160 Z' fill='url(%23shirtQ)'/>
    <path d='M65 115 C65 125 95 125 95 115 Z' fill='%23fbc4ab'/>
    <!-- Neck -->
    <rect x='68' y='88' width='24' height='30' rx='4' fill='url(%23skinQ)'/>
    <!-- Head/Face -->
    <ellipse cx='80' cy='68' rx='28' ry='34' fill='url(%23skinQ)'/>
    <!-- Ears -->
    <ellipse cx='51' cy='68' rx='4' ry='8' fill='%23fbc4ab'/>
    <ellipse cx='109' cy='68' rx='4' ry='8' fill='%23fbc4ab'/>
    <!-- Hair -->
    <path d='M49 60 C48 32 70 24 80 24 C94 24 112 32 111 60 C104 46 95 44 80 44 C65 44 56 48 49 60 Z' fill='%2318181b'/>
    <!-- Eyebrows -->
    <rect x='58' y='52' width='14' height='3' rx='1.5' fill='%2327272a'/>
    <rect x='88' y='52' width='14' height='3' rx='1.5' fill='%2327272a'/>
    <!-- Eyes -->
    <circle cx='65' cy='61' r='3.5' fill='%2318181b'/>
    <circle cx='66' cy='60' r='1' fill='%23ffffff'/>
    <circle cx='95' cy='61' r='3.5' fill='%2318181b'/>
    <circle cx='96' cy='60' r='1' fill='%23ffffff'/>
    <!-- Nose -->
    <path d='M79 66 L82 72 L78 73' stroke='%23e0a98b' stroke-width='2' fill='none' stroke-linecap='round'/>
    <!-- Smile -->
    <path d='M73 83 Q80 87 87 83' stroke='%23d97757' stroke-width='2.2' fill='none' stroke-linecap='round'/>
  </svg>`,

  // 韩浩 - Cute cartoon baby with yellow curls and bib
  hanhao: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <rect width='160' height='160' rx='28' fill='%23fef3c7'/>
    <!-- Circle frame -->
    <circle cx='80' cy='80' r='66' fill='%23ffffff' stroke='%23fde047' stroke-width='3'/>
    <!-- Cute baby head -->
    <ellipse cx='80' cy='78' rx='42' ry='38' fill='%23ffe4e6'/>
    <!-- Baby curl hair -->
    <path d='M76 42 C70 30 88 28 84 40 C90 35 96 42 90 46' fill='%23f59e0b' stroke='%23d97706' stroke-width='2'/>
    <!-- Cheeks blush -->
    <ellipse cx='54' cy='86' rx='8' ry='5' fill='%23fda4af' opacity='0.7'/>
    <ellipse cx='106' cy='86' rx='8' ry='5' fill='%23fda4af' opacity='0.7'/>
    <!-- Cute eyes -->
    <ellipse cx='64' cy='74' rx='4' ry='5' fill='%231e293b'/>
    <circle cx='65' cy='72' r='1.5' fill='%23ffffff'/>
    <ellipse cx='96' cy='74' rx='4' ry='5' fill='%231e293b'/>
    <circle cx='97' cy='72' r='1.5' fill='%23ffffff'/>
    <!-- Cute open mouth -->
    <path d='M76 86 Q80 94 84 86 Z' fill='%23e11d48'/>
    <!-- Baby bib -->
    <path d='M50 110 C50 135 110 135 110 110 C96 118 64 118 50 110 Z' fill='%2367e8f9' stroke='%230891b2' stroke-width='2'/>
    <!-- Small duck on bib -->
    <circle cx='80' cy='122' r='4' fill='%23facc15'/>
    <circle cx='83' cy='120' r='1' fill='%23000'/>
  </svg>`,

  // 史乐乐 - Couple/family in teal green sweaters
  shilele: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <rect width='160' height='160' rx='28' fill='%23f1f5f9'/>
    <!-- Left Person (Teal Sweater) -->
    <path d='M15 160 C15 125 35 116 65 116 C80 116 85 125 85 160 Z' fill='%230d9488'/>
    <ellipse cx='52' cy='72' rx='20' ry='24' fill='%23fde047'/>
    <ellipse cx='52' cy='70' rx='19' ry='23' fill='%23fed7aa'/>
    <path d='M32 64 C32 45 45 42 55 42 C68 42 72 50 72 64 C68 56 60 54 52 54 C42 54 36 58 32 64 Z' fill='%2378350f'/>
    <circle cx='46' cy='69' r='2' fill='%230f172a'/>
    <circle cx='58' cy='69' r='2' fill='%230f172a'/>
    <path d='M49 78 Q52 82 55 78' stroke='%23ea580c' stroke-width='1.5' fill='none'/>

    <!-- Right Person (Matching Teal Sweater) -->
    <path d='M75 160 C75 128 85 118 115 118 C140 118 148 128 148 160 Z' fill='%2314b8a6'/>
    <ellipse cx='110' cy='76' rx='19' ry='23' fill='%23ffedd5'/>
    <path d='M90 70 C90 48 105 44 118 44 C132 44 132 58 130 74 C124 58 115 56 108 56 C98 56 94 62 90 70 Z' fill='%231c1917'/>
    <circle cx='104' cy='74' r='2' fill='%230f172a'/>
    <circle cx='116' cy='74' r='2' fill='%230f172a'/>
    <path d='M107 83 Q110 87 113 83' stroke='%23ea580c' stroke-width='1.5' fill='none'/>
  </svg>`,

  // 马俊 - Retro artwork "联合起来" in starry crimson night sky
  majun: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <defs>
      <linearGradient id='mjSky' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='%231e1b4b'/>
        <stop offset='60%' stop-color='%23312e81'/>
        <stop offset='100%' stop-color='%23881337'/>
      </linearGradient>
    </defs>
    <rect width='160' height='160' rx='28' fill='url(%23mjSky)'/>
    <!-- Glowing Star -->
    <polygon points='80,24 85,38 99,39 88,48 92,62 80,54 68,62 72,48 61,39 75,38' fill='%23fef08a'/>
    <!-- Red Banner with Golden text -->
    <path d='M18 105 L142 105 L135 135 L25 135 Z' fill='%23dc2626' stroke='%23facc15' stroke-width='2'/>
    <text x='80' y='126' fill='%23fef08a' font-size='14' font-weight='bold' font-family='sans-serif' text-anchor='middle' letter-spacing='2'>联合起来</text>
    <!-- Stars -->
    <circle cx='35' cy='45' r='1.5' fill='%23ffffff'/>
    <circle cx='125' cy='52' r='2' fill='%23ffffff'/>
    <circle cx='40' cy='85' r='1' fill='%23ffffff'/>
    <circle cx='130' cy='88' r='1.5' fill='%23ffffff'/>
    <!-- Sickle & Hammer artistic silhouette -->
    <path d='M70 82 C65 68 85 62 90 74 C90 80 82 86 72 82 Z' fill='none' stroke='%23fef08a' stroke-width='3'/>
    <line x1='68' y1='84' x2='88' y2='68' stroke='%23fef08a' stroke-width='3'/>
  </svg>`,

  // 陈工 - CQX boy with red baseball cap
  chengong: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <rect width='160' height='160' rx='28' fill='%23e0f2fe'/>
    <!-- Red Baseball Cap -->
    <ellipse cx='80' cy='48' rx='42' ry='24' fill='%23ef4444'/>
    <path d='M38 52 C50 62 110 62 122 52 L140 56 C115 68 50 68 25 56 Z' fill='%23b91c1c'/>
    <!-- CQX text on cap -->
    <text x='80' y='46' fill='%23ffffff' font-size='12' font-weight='900' font-family='sans-serif' text-anchor='middle'>CQX</text>
    <!-- Face -->
    <ellipse cx='80' cy='88' rx='34' ry='36' fill='%23fde047'/>
    <ellipse cx='80' cy='86' rx='33' ry='34' fill='%23ffedd5'/>
    <!-- Ears -->
    <ellipse cx='45' cy='86' rx='5' ry='8' fill='%23fed7aa'/>
    <ellipse cx='115' cy='86' rx='5' ry='8' fill='%23fed7aa'/>
    <!-- Cheerful eyes -->
    <path d='M62 82 Q70 76 76 82' stroke='%231e293b' stroke-width='3' fill='none' stroke-linecap='round'/>
    <path d='M84 82 Q90 76 98 82' stroke='%231e293b' stroke-width='3' fill='none' stroke-linecap='round'/>
    <!-- Cheeks -->
    <circle cx='58' cy='94' r='6' fill='%23fda4af' opacity='0.7'/>
    <circle cx='102' cy='94' r='6' fill='%23fda4af' opacity='0.7'/>
    <!-- Big happy smile -->
    <path d='M66 98 Q80 112 94 98 Z' fill='%23e11d48'/>
    <path d='M70 100 Q80 106 90 100' fill='%23ffffff'/>
    <!-- Blue shirt collar -->
    <path d='M40 160 C40 135 60 128 80 128 C100 128 120 135 120 160 Z' fill='%233b82f6'/>
  </svg>`,

  // 马言言 - Girl sitting on tropical ocean deck / turquoise water
  mayanyan: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <defs>
      <linearGradient id='sea' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='%2338bdf8'/>
        <stop offset='50%' stop-color='%2306b6d4'/>
        <stop offset='100%' stop-color='%230284c7'/>
      </linearGradient>
    </defs>
    <rect width='160' height='160' rx='28' fill='url(%23sea)'/>
    <!-- Sun reflection ripples -->
    <ellipse cx='80' cy='50' rx='45' ry='8' fill='%23e0f2fe' opacity='0.4'/>
    <ellipse cx='110' cy='75' rx='30' ry='5' fill='%23e0f2fe' opacity='0.3'/>
    <!-- Wooden boardwalk deck -->
    <polygon points='0,105 160,105 160,160 0,160' fill='%23d97706'/>
    <line x1='0' y1='120' x2='160' y2='120' stroke='%23b45309' stroke-width='2'/>
    <line x1='0' y1='138' x2='160' y2='138' stroke='%23b45309' stroke-width='2'/>
    <!-- Girl sitting on dock -->
    <ellipse cx='80' cy='62' rx='16' ry='20' fill='%23ffedd5'/>
    <!-- Long brown hair flowing in sea breeze -->
    <path d='M64 56 C62 40 76 34 88 34 C98 34 102 44 98 62 C104 80 94 92 88 92' fill='%2378350f'/>
    <!-- Turquoise swimsuit -->
    <path d='M68 84 C68 76 92 76 92 84 L95 110 L65 110 Z' fill='%2306b6d4'/>
    <!-- Straw Hat -->
    <ellipse cx='80' cy='46' rx='32' ry='12' fill='%23fef08a' stroke='%23eab308' stroke-width='1.5'/>
    <ellipse cx='80' cy='44' rx='16' ry='8' fill='%23fef9c3'/>
  </svg>`,

  // 孟玉玺 - Majestic golden dragon/lion throne statue
  mengyuxi: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <defs>
      <linearGradient id='goldBg' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='%231e293b'/>
        <stop offset='100%' stop-color='%230f172a'/>
      </linearGradient>
      <linearGradient id='gold' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='%23fde047'/>
        <stop offset='50%' stop-color='%23eab308'/>
        <stop offset='100%' stop-color='%23ca8a04'/>
      </linearGradient>
    </defs>
    <rect width='160' height='160' rx='28' fill='url(%23goldBg)'/>
    <!-- Glowing aura -->
    <circle cx='80' cy='80' r='55' fill='%23ca8a04' opacity='0.25'/>
    <!-- Golden Lion/Dragon Head and Crown -->
    <path d='M50 48 L65 30 L80 44 L95 30 L110 48 L100 68 L60 68 Z' fill='url(%23gold)'/>
    <!-- Face -->
    <ellipse cx='80' cy='82' rx='36' ry='32' fill='url(%23gold)'/>
    <!-- Eyes -->
    <circle cx='66' cy='76' r='6' fill='%23713f12'/>
    <circle cx='66' cy='76' r='3' fill='%23fef08a'/>
    <circle cx='94' cy='76' r='6' fill='%23713f12'/>
    <circle cx='94' cy='76' r='3' fill='%23fef08a'/>
    <!-- Nose & Whiskers -->
    <path d='M74 86 L86 86 L80 94 Z' fill='%23854d0e'/>
    <path d='M60 92 Q42 96 38 106' stroke='url(%23gold)' stroke-width='3' fill='none'/>
    <path d='M100 92 Q118 96 122 106' stroke='url(%23gold)' stroke-width='3' fill='none'/>
    <!-- Royal Stone Base -->
    <rect x='30' y='122' width='100' height='26' rx='6' fill='%23b45309' stroke='%23fde047' stroke-width='2'/>
  </svg>`,

  // 李晓飞 - Night coastal lighthouse & starry twilight sky
  lixiaofei: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <defs>
      <linearGradient id='nightSky' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='%230f172a'/>
        <stop offset='50%' stop-color='%231e3a8a'/>
        <stop offset='100%' stop-color='%23172554'/>
      </linearGradient>
    </defs>
    <rect width='160' height='160' rx='28' fill='url(%23nightSky)'/>
    <!-- Starfield -->
    <circle cx='25' cy='30' r='1.5' fill='%23ffffff'/>
    <circle cx='55' cy='20' r='1' fill='%23ffffff'/>
    <circle cx='135' cy='28' r='2' fill='%23ffffff'/>
    <circle cx='110' cy='45' r='1' fill='%23ffffff'/>
    <circle cx='30' cy='75' r='1' fill='%23ffffff'/>
    <!-- Beaming Light Cone -->
    <polygon points='92,72 160,40 160,105' fill='%23fef08a' opacity='0.35'/>
    <polygon points='68,72 0,40 0,105' fill='%23fef08a' opacity='0.35'/>
    <!-- Lighthouse Tower -->
    <polygon points='74,75 86,75 92,145 68,145' fill='%23f8fafc'/>
    <!-- Red stripes on lighthouse -->
    <polygon points='72,95 88,95 89,112 71,112' fill='%23ef4444'/>
    <polygon points='70,126 90,126 91,138 69,138' fill='%23ef4444'/>
    <!-- Lantern Room -->
    <rect x='72' y='64' width='16' height='12' rx='2' fill='%23fef08a' stroke='%230f172a' stroke-width='2'/>
    <!-- Dome Top -->
    <path d='M70 64 Q80 50 90 64 Z' fill='%231e293b'/>
    <!-- Rocky Cliff -->
    <path d='M40 160 C55 138 105 138 135 160 Z' fill='%23334155'/>
  </svg>`,

  // 黄洋 - Anime pink hair boy
  huangyang: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <defs>
      <linearGradient id='hyBg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='%23fdf4ff'/>
        <stop offset='100%' stop-color='%23fae8ff'/>
      </linearGradient>
    </defs>
    <rect width='160' height='160' rx='28' fill='url(%23hyBg)'/>
    <!-- Clothes (Lilac collar) -->
    <path d='M30 160 C30 128 50 120 80 120 C110 120 130 128 130 160 Z' fill='%23c084fc'/>
    <!-- Face -->
    <ellipse cx='80' cy='78' rx='30' ry='34' fill='%23ffedd5'/>
    <!-- Anime Pink Hair (Soft, Layered) -->
    <path d='M44 68 C38 36 65 24 82 24 C104 24 122 36 118 68 C112 50 102 46 88 46 C74 46 60 52 44 68 Z' fill='%23f472b6'/>
    <!-- Hair bangs over forehead -->
    <polygon points='50,55 58,74 65,58' fill='%23f472b6'/>
    <polygon points='68,54 78,78 86,54' fill='%23f472b6'/>
    <polygon points='88,54 98,72 108,56' fill='%23f472b6'/>
    <!-- Big Anime Eyes -->
    <ellipse cx='66' cy='76' rx='5' ry='7' fill='%239333ea'/>
    <circle cx='67' cy='74' r='2' fill='%23ffffff'/>
    <ellipse cx='94' cy='76' rx='5' ry='7' fill='%239333ea'/>
    <circle cx='95' cy='74' r='2' fill='%23ffffff'/>
    <!-- Blush -->
    <ellipse cx='58' cy='85' rx='6' ry='3' fill='%23f43f5e' opacity='0.5'/>
    <ellipse cx='102' cy='85' rx='6' ry='3' fill='%23f43f5e' opacity='0.5'/>
    <!-- Soft smile -->
    <path d='M75 92 Q80 96 85 92' stroke='%23e11d48' stroke-width='2' fill='none' stroke-linecap='round'/>
  </svg>`,

  // 杨美丽 - Clean lineart girl drinking coffee "开心最重要"
  yangmeili: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <rect width='160' height='160' rx='28' fill='%23f8fafc'/>
    <!-- Top slogan -->
    <rect x='34' y='16' width='92' height='20' rx='10' fill='%23fee2e2'/>
    <text x='80' y='30' fill='%23e11d48' font-size='10' font-weight='bold' font-family='sans-serif' text-anchor='middle'>开心最重要</text>
    <!-- Girl Head -->
    <ellipse cx='80' cy='75' rx='28' ry='30' fill='%23fff1f2'/>
    <!-- Cute Hair Bun -->
    <circle cx='80' cy='42' r='14' fill='%23334155'/>
    <path d='M52 68 C50 48 65 44 80 44 C95 44 108 48 108 68 C100 56 90 54 80 54 C68 54 60 58 52 68 Z' fill='%23334155'/>
    <!-- Eyes closed happily in curved smile -->
    <path d='M68 70 Q73 66 78 70' stroke='%230f172a' stroke-width='2.2' fill='none'/>
    <path d='M82 70 Q87 66 92 70' stroke='%230f172a' stroke-width='2.2' fill='none'/>
    <!-- Coffee Cup in hands -->
    <path d='M68 96 L72 128 L88 128 L92 96 Z' fill='%23f43f5e'/>
    <rect x='66' y='92' width='28' height='6' rx='3' fill='%23ffffff' stroke='%23e2e8f0' stroke-width='1'/>
    <!-- Steam -->
    <path d='M76 86 Q78 80 76 74' stroke='%2394a3b8' stroke-width='1.5' fill='none'/>
    <path d='M84 86 Q86 80 84 74' stroke='%2394a3b8' stroke-width='1.5' fill='none'/>
    <!-- White oversized sweater -->
    <path d='M40 160 C40 135 55 125 70 125 L90 125 C105 125 120 135 120 160 Z' fill='%23ffffff' stroke='%23cbd5e1' stroke-width='2'/>
  </svg>`,

  // 任云辉 - Kid in traditional Qing dynasty costume with official hat
  renyunhui: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <rect width='160' height='160' rx='28' fill='%23fef2f2'/>
    <!-- Red Official Hat with Tassel -->
    <ellipse cx='80' cy='52' rx='45' ry='12' fill='%231e293b'/>
    <path d='M50 52 C50 36 65 32 80 32 C95 32 110 36 110 52 Z' fill='%23b91c1c'/>
    <!-- Red Tassel & Jewel -->
    <circle cx='80' cy='30' r='5' fill='%23facc15'/>
    <line x1='80' y1='30' x2='102' y2='42' stroke='%23dc2626' stroke-width='3'/>
    <!-- Face -->
    <ellipse cx='80' cy='82' rx='30' ry='32' fill='%23ffedd5'/>
    <!-- Round spectacles -->
    <circle cx='68' cy='78' r='9' stroke='%2378350f' stroke-width='2' fill='none'/>
    <circle cx='92' cy='78' r='9' stroke='%2378350f' stroke-width='2' fill='none'/>
    <line x1='77' y1='78' x2='83' y2='78' stroke='%2378350f' stroke-width='2'/>
    <!-- Eyes -->
    <circle cx='68' cy='78' r='3' fill='%231e293b'/>
    <circle cx='92' cy='78' r='3' fill='%231e293b'/>
    <!-- Smile -->
    <path d='M74 96 Q80 102 86 96' stroke='%23b91c1c' stroke-width='2.5' fill='none'/>
    <!-- Qing Court Silk Robe -->
    <path d='M35 160 C35 125 55 116 80 116 C105 116 125 125 125 160 Z' fill='%231e3a8a'/>
    <!-- Square official rank badge on chest -->
    <rect x='66' y='126' width='28' height='26' fill='%23facc15' stroke='%23b91c1c' stroke-width='2'/>
  </svg>`,

  // 刘建明 - Young man with bold black text "我叫彪子"
  liujianming: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <rect width='160' height='160' rx='28' fill='%23f8fafc'/>
    <!-- Body & Shirt -->
    <path d='M25 160 C25 126 48 116 80 116 C112 116 135 126 135 160 Z' fill='%23ffffff' stroke='%23e2e8f0' stroke-width='2'/>
    <!-- Bold text "我叫彪子" printed on t-shirt -->
    <rect x='42' y='128' width='76' height='24' rx='4' fill='%230f172a'/>
    <text x='80' y='145' fill='%23ffffff' font-size='13' font-weight='900' font-family='sans-serif' text-anchor='middle' letter-spacing='1.5'>我叫彪子</text>
    <!-- Face -->
    <ellipse cx='80' cy='68' rx='27' ry='32' fill='%23fed7aa'/>
    <!-- Short black hair -->
    <path d='M52 60 C50 34 68 28 80 28 C92 28 108 34 108 60 C100 48 92 46 80 46 C68 46 60 48 52 60 Z' fill='%231e293b'/>
    <!-- Expressive face -->
    <circle cx='68' cy='64' r='3.5' fill='%230f172a'/>
    <circle cx='92' cy='64' r='3.5' fill='%230f172a'/>
    <!-- Raised eyebrow -->
    <line x1='63' y1='56' x2='73' y2='56' stroke='%230f172a' stroke-width='2'/>
    <line x1='87' y1='58' x2='97' y2='54' stroke='%230f172a' stroke-width='2'/>
    <!-- Confident smirk -->
    <path d='M74 83 Q82 87 88 80' stroke='%23c2410c' stroke-width='2.2' fill='none' stroke-linecap='round'/>
  </svg>`,

  // 何坤 - Anime boy with light blonde/silver hair
  hekun: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <defs>
      <linearGradient id='hkBg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='%23e0e7ff'/>
        <stop offset='100%' stop-color='%23c7d2fe'/>
      </linearGradient>
    </defs>
    <rect width='160' height='160' rx='28' fill='url(%23hkBg)'/>
    <!-- High-collar jacket -->
    <path d='M25 160 C25 125 45 116 80 116 C115 116 135 125 135 160 Z' fill='%231e293b'/>
    <!-- Face -->
    <ellipse cx='80' cy='75' rx='28' ry='32' fill='%23ffedd5'/>
    <!-- Anime silver-blonde hair -->
    <path d='M42 68 C38 32 66 22 84 22 C104 22 120 32 116 68 C110 52 102 46 88 46 C74 46 58 52 42 68 Z' fill='%23fef08a'/>
    <polygon points='48,56 56,76 64,58' fill='%23fef08a'/>
    <polygon points='68,54 78,80 86,54' fill='%23fef08a'/>
    <polygon points='88,54 96,74 106,58' fill='%23fef08a'/>
    <!-- Eyes -->
    <ellipse cx='66' cy='74' rx='4' ry='5' fill='%233b82f6'/>
    <circle cx='67' cy='72' r='1.5' fill='%23ffffff'/>
    <ellipse cx='94' cy='74' rx='4' ry='5' fill='%233b82f6'/>
    <circle cx='95' cy='72' r='1.5' fill='%23ffffff'/>
    <!-- Smile -->
    <path d='M75 88 Q80 92 85 88' stroke='%23ea580c' stroke-width='2' fill='none'/>
  </svg>`,

  // 马宸卓 - Young boy looking out back over green fields
  machenzhuo: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <defs>
      <linearGradient id='skyMcz' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='%2367e8f9'/>
        <stop offset='60%' stop-color='%23bae6fd'/>
        <stop offset='100%' stop-color='%2386efac'/>
      </linearGradient>
    </defs>
    <rect width='160' height='160' rx='28' fill='url(%23skyMcz)'/>
    <!-- Green hills in distance -->
    <path d='M0 120 Q50 95 100 115 T160 110 L160 160 L0 160 Z' fill='%2322c55e'/>
    <path d='M0 135 Q70 120 160 130 L160 160 L0 160 Z' fill='%2315803d'/>
    <!-- Boy from back view -->
    <path d='M45 160 C45 130 60 122 80 122 C100 122 115 130 115 160 Z' fill='%23f8fafc'/>
    <!-- Boy head from back (dark brown hair) -->
    <ellipse cx='80' cy='95' rx='22' ry='24' fill='%23451a03'/>
    <!-- Soft hair texture -->
    <path d='M60 95 Q80 72 100 95' fill='%2378350f'/>
  </svg>`,

  // 吴鑫 - Black-and-white manga sketch boy with tousled dark hair
  wuxin: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160' width='160' height='160'>
    <rect width='160' height='160' rx='28' fill='%23ffffff' stroke='%23e2e8f0' stroke-width='2'/>
    <!-- Shaded manga background hatching -->
    <line x1='120' y1='10' x2='150' y2='40' stroke='%23cbd5e1' stroke-width='1.5'/>
    <line x1='130' y1='10' x2='160' y2='40' stroke='%23cbd5e1' stroke-width='1.5'/>
    <!-- Manga Dark Hair Spikes -->
    <path d='M35 80 L45 35 L65 48 L80 22 L98 46 L120 30 L115 80 L128 95 L112 92 L75 110 L45 95 Z' fill='%2318181b'/>
    <!-- Sharp Manga Jawline -->
    <polygon points='50,75 80,118 110,75' fill='%23fff1f2' stroke='%2318181b' stroke-width='2.5'/>
    <!-- Manga Eyes (Sharp, intense look) -->
    <polygon points='60,78 72,82 62,85' fill='%2318181b'/>
    <polygon points='100,78 88,82 98,85' fill='%2318181b'/>
    <!-- High-collar jacket -->
    <polygon points='40,160 50,115 80,128 110,115 120,160' fill='%2327272a' stroke='%2318181b' stroke-width='2'/>
  </svg>`,
};
