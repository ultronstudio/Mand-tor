
import type { Party } from '../types';

export const parties: Party[] = [
    {
        name: "ANO 2011",
        leader: "Andrej Babiš",
        ideology: "Populismus, Centristický liberalismus, Konzervatismus",
        motto: "Pro lidi, ne pro politiky.",
        candidates: ["Andrej Babiš", "Karel Havlíček", "Alena Schillerová"],
        summary: "Hnutí založené Andrejem Babišem, které klade důraz na efektivní řízení státu a boj proti korupci. Ekonomicky se profiluje jako středové s důrazem na podporu podnikání a investic."
    },
    {
        name: "SPOLU (ODS, KDU-ČSL, TOP 09)",
        leader: "Petr Fiala (ODS)",
        ideology: "Liberální konzervatismus, Křesťanská demokracie, Pro-evropanismus",
        motto: "Dáme Česko dohromady.",
        candidates: ["Petr Fiala", "Markéta Pekarová Adamová", "Marian Jurečka"],
        summary: "Koalice tří stran, která se zaměřuje na prozápadní směřování, fiskální odpovědnost a podporu tradičních hodnot. Vznikla jako opozice vůči vládě Andreje Babiše."
    },
    {
        name: "Česká pirátská strana",
        leader: "Ivan Bartoš",
        ideology: "Liberální progresivismus, Digitalizace, Transparentnost",
        motto: "Pusťte nás na ně!",
        candidates: ["Ivan Bartoš", "Olga Richterová", "Jakub Michálek"],
        summary: "Strana zaměřená na témata digitalizace, transparentnosti státní správy, občanských svobod a ochrany životního prostředí. Cílí především na mladší a liberální voliče."
    },
    {
        name: "Svoboda a přímá demokracie (SPD)",
        leader: "Tomio Okamura",
        ideology: "Pravicový populismus, Nacionalismus, Euros skepticismus",
        motto: "Česká republika na 1. místě!",
        candidates: ["Tomio Okamura", "Radim Fiala", "Radek Koten"],
        summary: "Hnutí prosazující přímou demokracii, vystoupení z EU a politiku nulové tolerance k nelegální migraci. Silně se vymezuje proti zavedeným politickým elitám."
    },
    {
        name: "STAROSTOVÉ A NEZÁVISLÍ (STAN)",
        leader: "Vít Rakušan",
        ideology: "Liberalismus, Decentralizace, Podpora regionů",
        motto: "Starostové znají řešení.",
        candidates: ["Vít Rakušan", "Jan Farský", "Věra Kovářová"],
        summary: "Hnutí vzešlé z komunální politiky, které klade důraz na decentralizaci moci, posílení obcí a regionů a efektivní a moderní státní správu."
    },
    {
        name: "Stačilo!",
        leader: "Kateřina Konečná",
        ideology: "Komunismus, Levicový populismus, Anti-NATO",
        motto: "Mír. Spravedlnost. Suverenita.",
        candidates: ["Kateřina Konečná", "Josef Skála"],
        summary: "Široká levicová koalice vedená KSČM, která se soustředí na sociální spravedlnost, kritiku kapitalismu a vystoupení z vojenských paktů jako je NATO."
    },
    {
        name: "PŘÍSAHA občanské hnutí",
        leader: "Robert Šlachta",
        ideology: "Boj proti korupci, Konzervatismus, Právo a pořádek",
        motto: "Spravedlnost a pořádek.",
        candidates: ["Robert Šlachta"],
        summary: "Hnutí založené bývalým policistou Robertem Šlachtou s hlavním programem boje proti korupci, prosazování práva a spravedlnosti."
    },
    {
        name: "Motoristé sobě",
        leader: "Petr Macinka",
        ideology: "Obrana práv motoristů, Konzervatismus, Kritika zelené politiky",
        motto: "Jezdíme, tedy jsme!",
        candidates: ["Petr Macinka", "Filip Turek"],
        summary: "Politická strana hájící zájmy motoristů, kritizující ekologické regulace a podporující individuální svobodu."
    },
    {
        name: "ČSSD – Česká suverenita sociální demokracie",
        leader: "Jiří Paroubek",
        ideology: "Sociální demokracie, Národní konzervatismus, Euros skepticismus",
        motto: "Hájíme české zájmy.",
        candidates: ["Jiří Paroubek"],
        summary: "Strana kombinující tradiční sociálnědemokratické hodnoty s důrazem na národní suverenitu a ochranu národních zájmů."
    },
    {
        name: "Levice",
        leader: "Kolektivní vedení",
        ideology: "Demokratický socialismus, Progresivismus, Ekosocialismus",
        motto: "Budoucnost pro všechny, ne pro miliardáře.",
        candidates: [],
        summary: "Moderní levicová strana zaměřená na sociální spravedlnost, ekologii, práva zaměstnanců a dostupnost veřejných služeb."
    },
    {
        name: "Volt Česko",
        leader: "Adam Hanka, Barbora Hrubá",
        ideology: "Pro-evropanismus, Sociální liberalismus, Progresivismus",
        motto: "Nová politika pro Evropu.",
        candidates: ["Adam Hanka", "Barbora Hrubá"],
        summary: "Panevropské politické hnutí, které usiluje o reformu a posílení Evropské unie na federálních principech."
    },
    {
        name: "Koruna Česká (monarchistická strana Čech, Moravy a Slezska)",
        leader: "Vojtěch Círus",
        ideology: "Monarchismus, Konzervatismus, Tradicionalismus",
        motto: "Za Krále a vlast!",
        candidates: ["Vojtěch Círus"],
        summary: "Strana usilující o obnovu monarchie v českých zemích formou parlamentní monarchie a návrat k tradičním hodnotám."
    },
    {
        name: "Rebelové",
        leader: "Neznámý",
        ideology: "Protestní hnutí, Nespecifikováno",
        motto: "Proti systému.",
        candidates: [],
        summary: "Protestní hnutí zaměřené na kritiku zavedených politických struktur a elit."
    },
    {
        name: "Moravské zemské hnutí",
        leader: "Ondřej Hýsek",
        ideology: "Moravský regionalismus, Autonomismus",
        motto: "Za Moravu!",
        candidates: ["Ondřej Hýsek"],
        summary: "Hnutí usilující o větší autonomii a zviditelnění Moravy v rámci České republiky, podporující moravskou kulturu a identitu."
    },
    {
        name: "Jasný signál nezávislých",
        leader: "Neznámý",
        ideology: "Nezávislí kandidáti, Lokalismus",
        motto: "Slušnost a rozum.",
        candidates: [],
        summary: "Sdružení nezávislých kandidátů s důrazem na komunální a regionální politiku a přímé zapojení občanů."
    },
    {
        name: "Výzva 2025",
        leader: "Neznámý",
        ideology: "Nespecifikováno",
        motto: "Změna je nutná.",
        candidates: [],
        summary: "Politická iniciativa s cílem prosadit konkrétní společenské a politické změny do roku 2025."
    },
    {
        name: "SMS – Stát má sloužit",
        leader: "Neznámý",
        ideology: "Efektivní stát, Antibyrokracie",
        motto: "Stát pro občany.",
        candidates: [],
        summary: "Hnutí s důrazem na efektivní, transparentní a přívětivou státní správu, která slouží občanům."
    },
    {
        name: "Česká republika na 1. místě!",
        leader: "Ladislav Vrabel",
        ideology: "Nacionalismus, Přímá demokracie, Anti-globalismus",
        motto: "Česko na 1. místě!",
        candidates: ["Ladislav Vrabel"],
        summary: "Iniciativa vzniklá z protivládních demonstrací, která klade důraz na národní zájmy, suverenitu a přímou demokracii."
    },
    {
        name: "Švýcarská demokracie",
        leader: "Tomáš Ra Moudrý",
        ideology: "Přímá demokracie, Libertarianismus, Minimalistický stát",
        motto: "Svoboda a odpovědnost.",
        candidates: [],
        summary: "Hnutí inspirované švýcarským politickým modelem s důrazem na referenda, přímou demokracii a minimální stát."
    },
    {
        name: "Nevolte Urza.cz",
        leader: "Martin Urza",
        ideology: "Anarchokapitalismus, Libertarianismus",
        motto: "Nehlasujte pro nikoho, ani pro nás.",
        candidates: ["Martin Urza"],
        summary: "Recesisticko-politické hnutí prosazující anarchokapitalismus, zrušení státu a maximální individuální svobodu."
    },
    {
        name: "Hnutí občanů a podnikatelů",
        leader: "Neznámý",
        ideology: "Podpora podnikání, Liberalismus",
        motto: "Méně byrokracie, více příležitostí.",
        candidates: [],
        summary: "Hnutí zaměřené na zlepšení podmínek pro podnikatele a živnostníky, snižování daní a byrokratické zátěže."
    },
    {
        name: "Hnutí Generace",
        leader: "Daniel Gulasi",
        ideology: "Politika pro mladé, Liberalismus, Progresivismus",
        motto: "Budoucnost patří nám.",
        candidates: ["Daniel Gulasi"],
        summary: "Politické hnutí zaměřené na témata a problémy mladé generace, jako je bydlení, vzdělávání a digitální budoucnost."
    },
    {
        name: "Volte Pravý Blok",
        leader: "Petr Cibulka",
        ideology: "Antikomunismus, Pravicový radikalismus",
        motto: "Proti všem zlodějům!",
        candidates: ["Petr Cibulka"],
        summary: "Politická strana s dlouhodobě radikálně antikomunistickým programem a důrazem na lustrace."
    },
    {
        name: "Balbínova poetická strana",
        leader: "Jiří Hrdina",
        ideology: "Recesismus, Satira, Humor",
        motto: "Slibujeme všechno!",
        candidates: [],
        summary: "Satirická a recesistická strana, která paroduje politickou scénu a její nešvary. Cílem je pobavit a upozornit na absurdity."
    },
    {
        name: "Hnutí Kruh",
        leader: "Neznámý",
        ideology: "Alternativní politika, Nespecifikováno",
        motto: "Vše souvisí se vším.",
        candidates: [],
        summary: "Politické hnutí s alternativním programem zaměřeným na celostní pohled na společnost, ekologii a spiritualitu."
    },
    {
        name: "Voluntia",
        leader: "Neznámý",
        ideology: "Občanská angažovanost, Dobrovolnictví",
        motto: "Síla vůle.",
        candidates: [],
        summary: "Politické hnutí s programem založeným na podpoře dobrovolnictví, občanské společnosti a vzájemné pomoci."
    }
];
