const fs = require('fs');

const tvPuzzles = [
    {
        date: "2026-07-17",
        category: "The Domestic / Family Sitcom",
        events: [
            { event: "Leave It to Beaver premieres, epitomizing the idealized mid-century American nuclear family.", year: 1957 },
            { event: "The Brady Bunch debuts, defining the blended family sitcom for a generation.", year: 1969 },
            { event: "The Cosby Show premieres, revitalizing the family sitcom format on NBC.", year: 1984 },
            { event: "The Simpsons debuts as a half-hour series, satirizing the traditional family unit.", year: 1989 },
            { event: "Everybody Loves Raymond premieres, mining comedy from overbearing extended family.", year: 1996 },
            { event: "Malcolm in the Middle debuts, offering a chaotic, single-camera look at family life.", year: 2000 },
            { event: "Black-ish premieres, exploring a family's sociopolitical and cultural identity.", year: 2014 }
        ]
    },
    {
        date: "2026-08-25",
        category: "The Workplace Sitcom",
        events: [
            { event: "The Mary Tyler Moore Show debuts, focusing on the newsroom staff at WJM-TV.", year: 1970 },
            { event: "Taxi premieres, following the diverse and eccentric drivers of the Sunshine Cab Company.", year: 1978 },
            { event: "Cheers debuts, opening the doors to a Boston bar where everybody knows your name.", year: 1982 },
            { event: "NewsRadio premieres, showcasing the brilliant ensemble cast of a fictional AM radio station.", year: 1995 },
            { event: "Scrubs debuts, mixing fast-paced medical comedy with deep workplace drama at Sacred Heart Hospital.", year: 2001 },
            { event: "Parks and Recreation premieres, introducing the optimistic Leslie Knope and the Pawnee Parks Department.", year: 2009 },
            { event: "Superstore debuts, following the employees of the fictional big-box store Cloud 9.", year: 2015 }
        ]
    },
    {
        date: "2026-09-18",
        category: "The 'Hangout' / Friend Group Sitcom",
        events: [
            { event: "Happy Days premieres, centering around Richie Cunningham, Fonzie, and their friends at Arnold's Drive-In.", year: 1974 },
            { event: "The Golden Girls debuts, proving that a lively friend group sitcom works perfectly for women in their 50s and 60s.", year: 1985 },
            { event: "Friends premieres on NBC, launching its six stars to global fame from the Central Perk coffee shop.", year: 1994 },
            { event: "That '70s Show debuts, following a group of teenage friends hanging out in a Wisconsin basement.", year: 1998 },
            { event: "How I Met Your Mother premieres, tracking a tight-knit friend group in NYC through MacLaren's Pub.", year: 2005 },
            { event: "New Girl debuts, exploring the chaotic dynamic of four roommates sharing an LA loft.", year: 2011 },
            { event: "Broad City premieres, chronicling the daily misadventures of two best friends in New York City.", year: 2014 }
        ]
    },
    {
        date: "2026-10-21",
        category: "The Fish-Out-of-Water Sitcom",
        events: [
            { event: "The Beverly Hillbillies premieres, following a poor family who strikes oil and moves to a wealthy California mansion.", year: 1962 },
            { event: "Green Acres debuts, featuring a wealthy New York City couple attempting to live as farmers.", year: 1965 },
            { event: "Diff'rent Strokes premieres, following two boys from Harlem taken in by a wealthy Park Avenue businessman.", year: 1978 },
            { event: "Perfect Strangers debuts, exploring the culture clash between a midwesterner and his distant Mediterranean cousin.", year: 1986 },
            { event: "The Fresh Prince of Bel-Air premieres, starring Will Smith as a street-smart teen sent to live with wealthy relatives.", year: 1990 },
            { event: "Schitt's Creek debuts, stranding a formerly filthy-rich family in a run-down rural town.", year: 2015 },
            { event: "Ted Lasso premieres, following an optimistic American football coach hired to manage an English soccer team.", year: 2020 }
        ]
    },
    {
        date: "2026-11-20",
        category: "The High-Concept / Supernatural Sitcom",
        events: [
            { event: "Bewitched premieres, following a powerful witch who marries an ordinary mortal man.", year: 1964 },
            { event: "I Dream of Jeannie debuts, focusing on a 2,000-year-old genie and the astronaut who rescues her.", year: 1965 },
            { event: "ALF premieres, following an alien from the planet Melmac who crashes into a suburban family's garage.", year: 1986 },
            { event: "3rd Rock from the Sun debuts, featuring a group of extraterrestrials posing as a human family on Earth.", year: 1996 },
            { event: "The Good Place premieres, twisting philosophy and the afterlife into a bright, colorful sitcom format.", year: 2016 },
            { event: "Ghosts (Original UK Series) debuts, following a young couple who inherit a haunted country house.", year: 2019 },
            { event: "WandaVision premieres, trapping two Marvel superheroes inside evolving eras of classic television sitcoms.", year: 2021 }
        ]
    },
    {
        date: "2026-12-16",
        category: "The Satirical / 'No Hugging, No Learning' Sitcom",
        events: [
            { event: "Married... with Children premieres, providing a raunchy, cynical counter-programming option to wholesome family sitcoms.", year: 1987 },
            { event: "Seinfeld debuts as The Seinfeld Chronicles, famously championing a 'no hugging, no learning' mantra.", year: 1989 },
            { event: "The Larry Sanders Show premieres on HBO, offering a dark, satirical behind-the-scenes look at a late-night talk show.", year: 1992 },
            { event: "Curb Your Enthusiasm debuts, turning minor social grievances into massively awkward disasters.", year: 2000 },
            { event: "Arrested Development premieres, chronicling the highly selfish, out-of-touch Bluth family.", year: 2003 },
            { event: "It's Always Sunny in Philadelphia debuts, pushing the boundaries of terrible behavior among a group of pub owners.", year: 2005 },
            { event: "Veep premieres on HBO, providing a razor-sharp, profane satire of American politics.", year: 2012 }
        ]
    },
    {
        date: "2027-01-18",
        category: "The Mockumentary Sitcom",
        events: [
            { event: "Trailer Park Boys premieres, utilizing a raw documentary style to follow the residents of Sunnyvale Trailer Park.", year: 2001 },
            { event: "Reno 911! debuts, spoofing the format of the documentary reality show COPS.", year: 2003 },
            { event: "The Office (US) premieres on NBC, popularizing the workplace mockumentary format for American audiences.", year: 2005 },
            { event: "Modern Family debuts, utilizing the mockumentary style to capture the dynamics of a large extended family.", year: 2009 },
            { event: "People Just Do Nothing premieres on the BBC, following the operators of a pirate radio station.", year: 2014 },
            { event: "What We Do in the Shadows debuts, applying the mockumentary format to a house of ancient vampires in Staten Island.", year: 2019 },
            { event: "Abbott Elementary premieres, following a documentary crew filming underfunded teachers in Philadelphia.", year: 2021 }
        ]
    },
    {
        date: "2026-07-27",
        category: "The Procedural (Case-of-the-Week)",
        events: [
            { event: "Hawaii Five-O premieres, bringing high-stakes police procedural action to the tropical islands.", year: 1968 },
            { event: "Columbo debuts as a regular series, popularizing the 'howcatchem' inverted detective format.", year: 1971 },
            { event: "Murder, She Wrote premieres, starring Angela Lansbury as the mystery-solving author Jessica Fletcher.", year: 1984 },
            { event: "Law & Order debuts, defining the modern two-part police and legal procedural format.", year: 1990 },
            { event: "CSI: Crime Scene Investigation premieres, heavily influencing the depiction of forensic science in pop culture.", year: 2000 },
            { event: "NCIS debuts, eventually growing into one of the most-watched procedural franchises in the world.", year: 2003 },
            { event: "House M.D. premieres, applying the Sherlock Holmes detective formula to rare medical diagnoses.", year: 2004 }
        ]
    },
    {
        date: "2026-08-08",
        category: "The Serialized / Prestige Drama",
        events: [
            { event: "Twin Peaks premieres, proving that network television could support deeply serialized, cinematic storytelling.", year: 1990 },
            { event: "The Sopranos debuts on HBO, heavily popularizing the anti-hero protagonist in prestige drama.", year: 1999 },
            { event: "The Wire premieres, offering an unparalleled, novelistic look at the institutions of Baltimore.", year: 2002 },
            { event: "Mad Men debuts on AMC, utilizing the 1960s advertising world for deep character studies.", year: 2007 },
            { event: "Breaking Bad premieres, tracking a mild-mannered chemistry teacher's descent into a ruthless drug kingpin.", year: 2008 },
            { event: "True Detective debuts, setting the gold standard for the modern prestige anthology format.", year: 2014 },
            { event: "Succession premieres, fascinating audiences with the ruthless, morally bankrupt Roy family.", year: 2018 }
        ]
    },
    {
        date: "2026-09-01",
        category: "The Genre / Speculative Drama",
        events: [
            { event: "The Twilight Zone premieres, using speculative fiction to explore complex morality tales.", year: 1959 },
            { event: "Star Trek (The Original Series) debuts, building an optimistic sci-fi universe that would span decades.", year: 1966 },
            { event: "The X-Files premieres, making aliens, monsters, and government conspiracies watercooler conversation.", year: 1993 },
            { event: "Lost debuts, hooking global audiences with its mysterious island and supernatural mythology.", year: 2004 },
            { event: "Game of Thrones premieres on HBO, bringing unprecedented scale and budget to high fantasy television.", year: 2011 },
            { event: "Stranger Things debuts on Netflix, creating a massive phenomenon out of sci-fi horror and 1980s nostalgia.", year: 2016 },
            { event: "Severance premieres, exploring a dystopian sci-fi world where work and personal memories are surgically divided.", year: 2022 }
        ]
    },
    {
        date: "2026-10-13",
        category: "The Melodrama / Soap Opera",
        events: [
            { event: "Dallas premieres, captivating audiences with oil tycoon wealth and the 'Who shot J.R.?' phenomenon.", year: 1978 },
            { event: "Dynasty debuts, offering a wildly dramatic, campy look at wealthy rival families in Colorado.", year: 1981 },
            { event: "Melrose Place premieres, turning a Los Angeles apartment complex into a hub of betrayal and manipulation.", year: 1992 },
            { event: "Grey's Anatomy debuts, blending high-stakes medical cases with intense romantic melodrama.", year: 2005 },
            { event: "Scandal premieres, delivering fast-paced, addictive political melodrama in Washington D.C.", year: 2012 },
            { event: "This Is Us debuts, utilizing multiple timelines to deliver highly emotional, tear-jerking family drama.", year: 2016 },
            { event: "Yellowstone premieres, reviving the prime-time soap opera format through the lens of a modern Western ranch.", year: 2018 }
        ]
    },
    {
        date: "2026-11-08",
        category: "The Period / Historical Drama",
        events: [
            { event: "Roots premieres, a landmark historical miniseries that gripped the entire nation.", year: 1977 },
            { event: "Band of Brothers debuts on HBO, offering a harrowing, cinematic look at WWII.", year: 2001 },
            { event: "Rome premieres, setting a new standard for high-budget historical epics on television.", year: 2005 },
            { event: "Downton Abbey debuts, exploring the rigid class structures of a post-Edwardian English country estate.", year: 2010 },
            { event: "Peaky Blinders premieres, stylizing the violent post-WWI criminal underworld of Birmingham.", year: 2013 },
            { event: "The Crown debuts on Netflix, chronically the decades-long reign of Queen Elizabeth II.", year: 2016 },
            { event: "Chernobyl premieres, meticulously dramatizing the catastrophic 1986 nuclear disaster.", year: 2019 }
        ]
    },
    {
        date: "2026-12-02",
        category: "The Political / Legal / Espionage Thriller",
        events: [
            { event: "The West Wing premieres, offering an idealized, fast-talking look at the inner workings of the White House.", year: 1999 },
            { event: "24 debuts, revolutionizing the espionage thriller with its real-time ticking clock format.", year: 2001 },
            { event: "Damages premieres, presenting a dark, ruthless take on high-stakes corporate litigation.", year: 2007 },
            { event: "The Good Wife debuts, wrapping complex legal and political maneuvering inside a network procedural format.", year: 2009 },
            { event: "Homeland premieres, delivering tense, psychological espionage involving the CIA and terrorism.", year: 2011 },
            { event: "House of Cards debuts, following a deeply corrupt politician's ruthless climb to the presidency.", year: 2013 },
            { event: "Billions premieres, exploring the high-stakes financial warfare between a hedge fund king and a US Attorney.", year: 2016 }
        ]
    },
    {
        date: "2027-01-09",
        category: "The Teen / Coming-of-Age Drama",
        events: [
            { event: "Beverly Hills, 90210 premieres, defining the modern teen drama genre for the entire decade.", year: 1990 },
            { event: "My So-Called Life debuts, offering a deeply realistic and critically acclaimed look at teenage angst.", year: 1994 },
            { event: "Dawson's Creek premieres, famous for its highly articulate teenagers navigating complex relationships.", year: 1998 },
            { event: "The O.C. debuts, bringing indie rock and wealthy California drama to the forefront of pop culture.", year: 2003 },
            { event: "Friday Night Lights premieres, offering a grounded, documentary-style look at Texas high school football.", year: 2006 },
            { event: "Gossip Girl debuts, heavily influencing late 2000s teen fashion and internet culture.", year: 2007 },
            { event: "Euphoria premieres on HBO, providing a visually stunning, highly explicit look at modern teenage trauma.", year: 2019 }
        ]
    }
];

// 1. Update public/puzzles.json
let publicPuzzles = JSON.parse(fs.readFileSync('public/puzzles.json', 'utf8'));
for (const p of tvPuzzles) {
    const idx = publicPuzzles.findIndex(x => x.date === p.date);
    if (idx >= 0) publicPuzzles[idx] = p;
    else publicPuzzles.push(p);
}
fs.writeFileSync('public/puzzles.json', JSON.stringify(publicPuzzles, null, 2));

// 2. Generate the override strings to insert into functions/api/puzzles.js
let apiScript = fs.readFileSync('functions/api/puzzles.js', 'utf8');
let overrideStr = '';

for (const p of tvPuzzles) {
    overrideStr += `
    // Special Override for TV Puzzles - ${p.date}
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "${p.date}") {
            puzzles[i] = ${JSON.stringify(p, null, 16).replace(/\n\s{16}/g, '\n                ')};
        }
    }
`;
}

// Insert before the last override
apiScript = apiScript.replace('    // Special Override for Celebrity Arrests', overrideStr + '\n    // Special Override for Celebrity Arrests');
fs.writeFileSync('functions/api/puzzles.js', apiScript);

// 3. Bump cache in public/sw.js
let swScript = fs.readFileSync('public/sw.js', 'utf8');
let match = swScript.match(/timeline-cache-v(\d+)/);
if (match) {
    let nextV = parseInt(match[1]) + 1;
    swScript = swScript.replace(match[0], `timeline-cache-v${nextV}`);
    fs.writeFileSync('public/sw.js', swScript);
}
