export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const requestedDate = url.searchParams.get("date");
    const CATEGORIES = ["Sports","Landmarks","History","Entertainment","Business","Technology","Cinema","Science","Pop History","Geography"];

    // A hardcoded fallback dataset to ensure 60 days of high quality puzzles without relying on flaky APIs.
const FALLBACK_DATA = {
    "Sports": [
        {
            "event": "First recorded Olympic Games in Ancient Greece",
            "year": -776
        },
        {
            "event": "Ancient Olympic Games are abolished by Emperor Theodosius I",
            "year": 393
        },
        {
            "event": "Golf is banned by King James II of Scotland",
            "year": 1457
        },
        {
            "event": "Calcio Fiorentino, an early form of football, is codified in Florence",
            "year": 1530
        },
        {
            "event": "Cotswold Olimpick Games begin in England",
            "year": 1604
        },
        {
            "event": "First codified rules of boxing (Broughton's rules) are introduced",
            "year": 1743
        },
        {
            "event": "First official cricket match at Hambledon",
            "year": 1766
        },
        {
            "event": "William Webb Ellis purportedly invents rugby",
            "year": 1823
        },
        {
            "event": "First Oxford and Cambridge Boat Race",
            "year": 1829
        },
        {
            "event": "Grand National steeplechase is first run at Aintree",
            "year": 1839
        },
        {
            "event": "Knickerbocker rules for baseball are written",
            "year": 1845
        },
        {
            "event": "Cambridge rules for association football are drawn up",
            "year": 1848
        },
        {
            "event": "The America's Cup sailing race begins",
            "year": 1851
        },
        {
            "event": "Sheffield F.C., the world's oldest independent football club, is founded",
            "year": 1857
        },
        {
            "event": "First Open Championship in golf is held at Prestwick",
            "year": 1860
        },
        {
            "event": "The Football Association is formed in London",
            "year": 1863
        },
        {
            "event": "The Queensberry Rules for boxing are published",
            "year": 1867
        },
        {
            "event": "First recorded bicycle race at Parc de Saint-Cloud, Paris",
            "year": 1868
        },
        {
            "event": "Cincinnati Red Stockings become the first fully professional baseball team",
            "year": 1869
        },
        {
            "event": "The FA Cup tournament is inaugurated",
            "year": 1871
        },
        {
            "event": "First official international football match (Scotland vs England)",
            "year": 1872
        },
        {
            "event": "The Scottish Football Association is founded",
            "year": 1873
        },
        {
            "event": "The first Kentucky Derby is run",
            "year": 1875
        },
        {
            "event": "The National League of Professional Baseball Clubs is formed",
            "year": 1876
        },
        {
            "event": "First Wimbledon tennis championship is held",
            "year": 1877
        },
        {
            "event": "The Ashes cricket series between England and Australia originates",
            "year": 1882
        },
        {
            "event": "First Home Nations rugby championship",
            "year": 1883
        },
        {
            "event": "James Naismith invents basketball",
            "year": 1891
        },
        {
            "event": "First professional American football game is played",
            "year": 1892
        },
        {
            "event": "The Stanley Cup is first awarded for ice hockey",
            "year": 1893
        },
        {
            "event": "International Olympic Committee is founded",
            "year": 1894
        },
        {
            "event": "William G. Morgan invents volleyball",
            "year": 1895
        },
        {
            "event": "First modern Olympic Games are held in Athens",
            "year": 1896
        },
        {
            "event": "The first Boston Marathon is run",
            "year": 1897
        },
        {
            "event": "Women compete in the Olympics for the first time",
            "year": 1900
        },
        {
            "event": "The American League of Professional Baseball Clubs is founded",
            "year": 1901
        },
        {
            "event": "First Tour de France bicycle race takes place",
            "year": 1903
        },
        {
            "event": "FIFA (Fédération Internationale de Football Association) is founded",
            "year": 1904
        },
        {
            "event": "First Australian Open tennis tournament",
            "year": 1905
        },
        {
            "event": "First Grand Prix motor race is held in France",
            "year": 1906
        },
        {
            "event": "Figure skating becomes the first winter sport contested at the Olympics",
            "year": 1908
        },
        {
            "event": "The first Giro d'Italia cycling race",
            "year": 1909
        },
        {
            "event": "First Indianapolis 500 automobile race",
            "year": 1911
        },
        {
            "event": "IAAF (World Athletics) is founded",
            "year": 1912
        },
        {
            "event": "The PGA of America is founded",
            "year": 1916
        },
        {
            "event": "National Hockey League (NHL) is formed",
            "year": 1917
        },
        {
            "event": "The American Professional Football Association (later NFL) is founded",
            "year": 1920
        },
        {
            "event": "First water skiing performed by Ralph Samuelson",
            "year": 1922
        },
        {
            "event": "The first 24 Hours of Le Mans endurance race",
            "year": 1923
        },
        {
            "event": "First Winter Olympics in Chamonix, France",
            "year": 1924
        },
        {
            "event": "First Ryder Cup golf tournament is held",
            "year": 1927
        },
        {
            "event": "First FIFA World Cup is held in Uruguay",
            "year": 1930
        },
        {
            "event": "First baseball players to wear numbers on their backs regularly",
            "year": 1932
        },
        {
            "event": "First Masters Golf Tournament is played at Augusta National",
            "year": 1934
        },
        {
            "event": "Jesse Owens wins four gold medals at the Berlin Olympics",
            "year": 1936
        },
        {
            "event": "The National Baseball Hall of Fame opens",
            "year": 1939
        },
        {
            "event": "The Basketball Association of America (later NBA) is founded",
            "year": 1946
        },
        {
            "event": "Jackie Robinson breaks the baseball color line",
            "year": 1947
        },
        {
            "event": "The first Paralympic Games (Stoke Mandeville Games) take place",
            "year": 1948
        },
        {
            "event": "First Formula One World Championship race",
            "year": 1950
        },
        {
            "event": "Roger Bannister breaks the four-minute mile",
            "year": 1954
        },
        {
            "event": "First UEFA European Cup is held",
            "year": 1956
        },
        {
            "event": "The first official Paralympic Games are held in Rome",
            "year": 1960
        },
        {
            "event": "England wins the FIFA World Cup",
            "year": 1966
        },
        {
            "event": "First Super Bowl is played",
            "year": 1967
        },
        {
            "event": "Tommie Smith and John Carlos perform the Black Power salute at the Olympics",
            "year": 1968
        },
        {
            "event": "Brazil wins their third World Cup with Pelé",
            "year": 1970
        },
        {
            "event": "Title IX is passed in the USA, expanding women's sports",
            "year": 1972
        },
        {
            "event": "Billie Jean King wins the 'Battle of the Sexes' tennis match",
            "year": 1973
        },
        {
            "event": "The Rumble in the Jungle boxing match",
            "year": 1974
        },
        {
            "event": "Nadia Comăneci scores the first perfect 10 in Olympic gymnastics",
            "year": 1976
        },
        {
            "event": "The 'Miracle on Ice' at the Lake Placid Winter Olympics",
            "year": 1980
        },
        {
            "event": "Joan Benoit wins the first Olympic women's marathon",
            "year": 1984
        },
        {
            "event": "Diego Maradona scores the 'Hand of God' goal",
            "year": 1986
        },
        {
            "event": "Florence Griffith-Joyner sets the women's 100m world record",
            "year": 1988
        },
        {
            "event": "Buster Douglas knocks out Mike Tyson",
            "year": 1990
        },
        {
            "event": "The first FIFA Women's World Cup is held",
            "year": 1991
        },
        {
            "event": "The US 'Dream Team' competes at the Barcelona Olympics",
            "year": 1992
        },
        {
            "event": "Ayrton Senna dies at the San Marino Grand Prix",
            "year": 1994
        },
        {
            "event": "South Africa wins the Rugby World Cup, uniting the nation",
            "year": 1995
        },
        {
            "event": "MLS (Major League Soccer) plays its inaugural season",
            "year": 1996
        },
        {
            "event": "Tiger Woods wins his first Masters at age 21",
            "year": 1997
        },
        {
            "event": "France wins the FIFA World Cup on home soil",
            "year": 1998
        },
        {
            "event": "Brandi Chastain secures the US Women's World Cup victory",
            "year": 1999
        },
        {
            "event": "The XFL debuts its first season",
            "year": 2001
        },
        {
            "event": "First FIFA World Cup co-hosted by two nations (Japan/South Korea)",
            "year": 2002
        },
        {
            "event": "Boston Red Sox win the World Series, breaking the Curse of the Bambino",
            "year": 2004
        },
        {
            "event": "Usain Bolt sets 100m and 200m world records at the Beijing Olympics",
            "year": 2008
        },
        {
            "event": "Michael Phelps becomes the most decorated Olympian of all time",
            "year": 2012
        },
        {
            "event": "Leicester City remarkably wins the English Premier League",
            "year": 2016
        }
    ],
    "Landmarks": [
        {
            "event": "Great Pyramid of Giza completed",
            "year": -2560
        },
        {
            "event": "Stonehenge construction begins",
            "year": -2500
        },
        {
            "event": "Ziggurat of Ur built",
            "year": -2000
        },
        {
            "event": "Abu Simbel temples carved",
            "year": -1300
        },
        {
            "event": "Hanging Gardens of Babylon built",
            "year": -600
        },
        {
            "event": "Parthenon construction begins",
            "year": -447
        },
        {
            "event": "Parthenon completed",
            "year": -432
        },
        {
            "event": "Terracotta Army buried",
            "year": -220
        },
        {
            "event": "Colosseum construction begins",
            "year": 70
        },
        {
            "event": "Colosseum completed",
            "year": 80
        },
        {
            "event": "Pantheon rebuilt by Hadrian",
            "year": 118
        },
        {
            "event": "Hadrian's Wall construction begins",
            "year": 122
        },
        {
            "event": "St. Peter's Basilica (Old) consecrated",
            "year": 320
        },
        {
            "event": "Hagia Sophia construction begins",
            "year": 532
        },
        {
            "event": "Hagia Sophia completed",
            "year": 537
        },
        {
            "event": "Dome of the Rock completed",
            "year": 691
        },
        {
            "event": "Great Mosque of Córdoba begun",
            "year": 785
        },
        {
            "event": "Charlemagne's Palatine Chapel consecrated",
            "year": 814
        },
        {
            "event": "Borobudur Temple completed",
            "year": 850
        },
        {
            "event": "Westminster Abbey consecrated",
            "year": 1065
        },
        {
            "event": "Tower of London construction begins",
            "year": 1078
        },
        {
            "event": "Notre-Dame de Paris construction begins",
            "year": 1163
        },
        {
            "event": "Leaning Tower of Pisa construction begins",
            "year": 1173
        },
        {
            "event": "Krak des Chevaliers expanded by Hospitallers",
            "year": 1190
        },
        {
            "event": "Cologne Cathedral construction begins",
            "year": 1248
        },
        {
            "event": "Florence Cathedral construction begins",
            "year": 1296
        },
        {
            "event": "Notre-Dame de Paris completed",
            "year": 1345
        },
        {
            "event": "Great Wall of China (Ming dynasty) construction begins",
            "year": 1368
        },
        {
            "event": "Leaning Tower of Pisa completed",
            "year": 1373
        },
        {
            "event": "Forbidden City construction begins",
            "year": 1406
        },
        {
            "event": "Forbidden City completed",
            "year": 1420
        },
        {
            "event": "Florence Cathedral dome completed",
            "year": 1436
        },
        {
            "event": "Machu Picchu built (estimated)",
            "year": 1438
        },
        {
            "event": "Winter Palace (first version) built",
            "year": 1455
        },
        {
            "event": "St. Peter's Basilica (Current) construction begins",
            "year": 1506
        },
        {
            "event": "St. Basil's Cathedral construction begins",
            "year": 1555
        },
        {
            "event": "St. Basil's Cathedral completed",
            "year": 1561
        },
        {
            "event": "Rialto Bridge completed",
            "year": 1591
        },
        {
            "event": "Taj Mahal construction begins",
            "year": 1631
        },
        {
            "event": "Taj Mahal completed",
            "year": 1653
        },
        {
            "event": "Great Fire of London destroys St Paul's",
            "year": 1666
        },
        {
            "event": "St. Paul's Cathedral rebuilding begins",
            "year": 1675
        },
        {
            "event": "Palace of Versailles becomes royal residence",
            "year": 1682
        },
        {
            "event": "Buckingham Palace (Buckingham House) built",
            "year": 1703
        },
        {
            "event": "St. Paul's Cathedral completed",
            "year": 1708
        },
        {
            "event": "British Museum established",
            "year": 1753
        },
        {
            "event": "Trevi Fountain completed",
            "year": 1762
        },
        {
            "event": "White House construction begins",
            "year": 1792
        },
        {
            "event": "Louvre Museum opens",
            "year": 1793
        },
        {
            "event": "White House first occupied",
            "year": 1800
        },
        {
            "event": "Arc de Triomphe construction begins",
            "year": 1806
        },
        {
            "event": "Erie Canal opened",
            "year": 1825
        },
        {
            "event": "Arc de Triomphe completed",
            "year": 1836
        },
        {
            "event": "Big Ben bell cast",
            "year": 1858
        },
        {
            "event": "Big Ben clock tower completed",
            "year": 1859
        },
        {
            "event": "Suez Canal opens",
            "year": 1869
        },
        {
            "event": "Sagrada Família construction begins",
            "year": 1882
        },
        {
            "event": "Brooklyn Bridge opens",
            "year": 1883
        },
        {
            "event": "Washington Monument completed",
            "year": 1884
        },
        {
            "event": "Statue of Liberty dedicated",
            "year": 1886
        },
        {
            "event": "Eiffel Tower construction begins",
            "year": 1887
        },
        {
            "event": "Eiffel Tower opens",
            "year": 1889
        },
        {
            "event": "Tower Bridge opens",
            "year": 1894
        },
        {
            "event": "Grand Central Terminal opens",
            "year": 1913
        },
        {
            "event": "Panama Canal opens",
            "year": 1914
        },
        {
            "event": "Lincoln Memorial dedicated",
            "year": 1922
        },
        {
            "event": "Mount Rushmore carving begins",
            "year": 1927
        },
        {
            "event": "Chrysler Building completed",
            "year": 1930
        },
        {
            "event": "Empire State Building completed",
            "year": 1931
        },
        {
            "event": "Sydney Harbour Bridge opens",
            "year": 1932
        },
        {
            "event": "Golden Gate Bridge opens",
            "year": 1937
        },
        {
            "event": "Mount Rushmore completed",
            "year": 1941
        },
        {
            "event": "Pentagon completed",
            "year": 1943
        },
        {
            "event": "Gateway Arch construction begins",
            "year": 1956
        },
        {
            "event": "Tokyo Tower completed",
            "year": 1958
        },
        {
            "event": "Guggenheim Museum New York opens",
            "year": 1959
        },
        {
            "event": "Space Needle opens",
            "year": 1962
        },
        {
            "event": "Gateway Arch completed",
            "year": 1965
        },
        {
            "event": "Sydney Opera House opens",
            "year": 1973
        },
        {
            "event": "CN Tower opens",
            "year": 1976
        },
        {
            "event": "Louvre Pyramid completed",
            "year": 1989
        },
        {
            "event": "Channel Tunnel opens",
            "year": 1994
        },
        {
            "event": "Petronas Towers completed",
            "year": 1998
        },
        {
            "event": "London Eye erected",
            "year": 1999
        },
        {
            "event": "Taipei 101 completed",
            "year": 2004
        },
        {
            "event": "Burj Khalifa completed",
            "year": 2010
        },
        {
            "event": "The Shard completed",
            "year": 2012
        },
        {
            "event": "One World Trade Center opens",
            "year": 2014
        },
        {
            "event": "Panama Canal expansion opens",
            "year": 2016
        },
        {
            "event": "Expo 2020 Dubai pavilions open (delayed)",
            "year": 2021
        }
    ],
    "History": [
        {
            "event": "First Olympic Games",
            "year": -776
        },
        {
            "event": "Founding of Rome",
            "year": -753
        },
        {
            "event": "Battle of Marathon",
            "year": -490
        },
        {
            "event": "Assassination of Julius Caesar",
            "year": -44
        },
        {
            "event": "Fall of the Western Roman Empire",
            "year": 476
        },
        {
            "event": "Hijra of Muhammad",
            "year": 622
        },
        {
            "event": "Battle of Tours",
            "year": 732
        },
        {
            "event": "Coronation of Charlemagne",
            "year": 800
        },
        {
            "event": "Battle of Hastings",
            "year": 1066
        },
        {
            "event": "First Crusade captures Jerusalem",
            "year": 1099
        },
        {
            "event": "Signing of the Magna Carta",
            "year": 1215
        },
        {
            "event": "Fall of Baghdad to Mongols",
            "year": 1258
        },
        {
            "event": "Black Death begins in Europe",
            "year": 1347
        },
        {
            "event": "Fall of Constantinople",
            "year": 1453
        },
        {
            "event": "Columbus reaches the Americas",
            "year": 1492
        },
        {
            "event": "Vasco da Gama reaches India",
            "year": 1498
        },
        {
            "event": "Martin Luther posts his 95 Theses",
            "year": 1517
        },
        {
            "event": "Defeat of the Spanish Armada",
            "year": 1588
        },
        {
            "event": "Founding of Jamestown",
            "year": 1607
        },
        {
            "event": "Mayflower arrives at Plymouth",
            "year": 1620
        },
        {
            "event": "Peace of Westphalia",
            "year": 1648
        },
        {
            "event": "Great Fire of London",
            "year": 1666
        },
        {
            "event": "Glorious Revolution in England",
            "year": 1688
        },
        {
            "event": "Declaration of Independence",
            "year": 1776
        },
        {
            "event": "French Revolution begins",
            "year": 1789
        },
        {
            "event": "Haitian Independence",
            "year": 1804
        },
        {
            "event": "Battle of Waterloo",
            "year": 1815
        },
        {
            "event": "Invention of the telegraph",
            "year": 1837
        },
        {
            "event": "Revolutions of 1848",
            "year": 1848
        },
        {
            "event": "Publication of On the Origin of Species",
            "year": 1859
        },
        {
            "event": "American Civil War begins",
            "year": 1861
        },
        {
            "event": "Meiji Restoration in Japan",
            "year": 1868
        },
        {
            "event": "Completion of the Transcontinental Railroad",
            "year": 1869
        },
        {
            "event": "Unification of Germany",
            "year": 1871
        },
        {
            "event": "Invention of the telephone",
            "year": 1876
        },
        {
            "event": "Wright brothers' first flight",
            "year": 1903
        },
        {
            "event": "Russo-Japanese War begins",
            "year": 1904
        },
        {
            "event": "Einstein's theory of special relativity",
            "year": 1905
        },
        {
            "event": "San Francisco earthquake",
            "year": 1906
        },
        {
            "event": "Sinking of the Titanic",
            "year": 1912
        },
        {
            "event": "Assassination of Archduke Franz Ferdinand",
            "year": 1914
        },
        {
            "event": "Russian Revolution",
            "year": 1917
        },
        {
            "event": "End of World War I",
            "year": 1918
        },
        {
            "event": "Treaty of Versailles signed",
            "year": 1919
        },
        {
            "event": "League of Nations established",
            "year": 1920
        },
        {
            "event": "Irish Free State established",
            "year": 1922
        },
        {
            "event": "Munich Beer Hall Putsch",
            "year": 1923
        },
        {
            "event": "Death of Lenin",
            "year": 1924
        },
        {
            "event": "Scopes Monkey Trial",
            "year": 1925
        },
        {
            "event": "First solo transatlantic flight by Charles Lindbergh",
            "year": 1927
        },
        {
            "event": "Discovery of penicillin",
            "year": 1928
        },
        {
            "event": "Wall Street Crash",
            "year": 1929
        },
        {
            "event": "Gandhi's Salt March",
            "year": 1930
        },
        {
            "event": "Statute of Westminster",
            "year": 1931
        },
        {
            "event": "Hitler appointed Chancellor of Germany",
            "year": 1933
        },
        {
            "event": "Spanish Civil War begins",
            "year": 1936
        },
        {
            "event": "Invasion of Poland",
            "year": 1939
        },
        {
            "event": "Fall of France",
            "year": 1940
        },
        {
            "event": "Attack on Pearl Harbor",
            "year": 1941
        },
        {
            "event": "Battle of Midway",
            "year": 1942
        },
        {
            "event": "Warsaw Ghetto Uprising",
            "year": 1943
        },
        {
            "event": "D-Day landings",
            "year": 1944
        },
        {
            "event": "Atomic bombings of Hiroshima and Nagasaki",
            "year": 1945
        },
        {
            "event": "Nuremberg Trials begin",
            "year": 1946
        },
        {
            "event": "Independence of India and Pakistan",
            "year": 1947
        },
        {
            "event": "State of Israel established",
            "year": 1948
        },
        {
            "event": "NATO formed",
            "year": 1949
        },
        {
            "event": "Korean War begins",
            "year": 1950
        },
        {
            "event": "Discovery of DNA structure",
            "year": 1953
        },
        {
            "event": "Brown v. Board of Education decision",
            "year": 1954
        },
        {
            "event": "Montgomery Bus Boycott",
            "year": 1955
        },
        {
            "event": "Hungarian Revolution",
            "year": 1956
        },
        {
            "event": "Sputnik 1 launched",
            "year": 1957
        },
        {
            "event": "Cuban Revolution ends",
            "year": 1959
        },
        {
            "event": "Construction of the Berlin Wall",
            "year": 1961
        },
        {
            "event": "Cuban Missile Crisis",
            "year": 1962
        },
        {
            "event": "Assassination of JFK",
            "year": 1963
        },
        {
            "event": "Civil Rights Act signed",
            "year": 1964
        },
        {
            "event": "Six-Day War",
            "year": 1967
        },
        {
            "event": "Apollo 11 moon landing",
            "year": 1969
        },
        {
            "event": "Watergate break-in",
            "year": 1972
        },
        {
            "event": "Fall of Saigon",
            "year": 1975
        },
        {
            "event": "Iranian Revolution",
            "year": 1979
        },
        {
            "event": "Fall of the Berlin Wall",
            "year": 1989
        },
        {
            "event": "Dissolution of the Soviet Union",
            "year": 1991
        },
        {
            "event": "End of Apartheid in South Africa",
            "year": 1994
        },
        {
            "event": "Transfer of sovereignty over Hong Kong",
            "year": 1997
        },
        {
            "event": "September 11 attacks",
            "year": 2001
        },
        {
            "event": "Global financial crisis",
            "year": 2008
        },
        {
            "event": "Brexit referendum",
            "year": 2016
        }
    ],
    "Entertainment": [
        {
            "year": 1599,
            "event": "The Globe Theatre opens in London."
        },
        {
            "year": 1895,
            "event": "First public film screening by the Lumière brothers."
        },
        {
            "year": 1902,
            "event": "Georges Méliès releases 'A Trip to the Moon'."
        },
        {
            "year": 1903,
            "event": "'The Great Train Robbery' is released."
        },
        {
            "year": 1911,
            "event": "First Hollywood film studio opens."
        },
        {
            "year": 1914,
            "event": "Charlie Chaplin's Little Tramp character debuts."
        },
        {
            "year": 1915,
            "event": "'The Birth of a Nation' is released."
        },
        {
            "year": 1920,
            "event": "First commercial radio broadcast in the US (KDKA)."
        },
        {
            "year": 1922,
            "event": "'Nosferatu' is released."
        },
        {
            "year": 1923,
            "event": "Walt Disney Company is founded."
        },
        {
            "year": 1927,
            "event": "'The Jazz Singer', the first feature-length motion picture with synchronized dialogue, is released."
        },
        {
            "year": 1928,
            "event": "Mickey Mouse debuts in 'Steamboat Willie'."
        },
        {
            "year": 1929,
            "event": "The first Academy Awards ceremony is held."
        },
        {
            "year": 1930,
            "event": "The Motion Picture Production Code (Hays Code) is introduced."
        },
        {
            "year": 1931,
            "event": "Universal Pictures releases 'Dracula' starring Bela Lugosi."
        },
        {
            "year": 1933,
            "event": "'King Kong' is released."
        },
        {
            "year": 1935,
            "event": "First Technicolor feature film, 'Becky Sharp', is released."
        },
        {
            "year": 1937,
            "event": "'Snow White and the Seven Dwarfs' premieres."
        },
        {
            "year": 1938,
            "event": "Orson Welles broadcasts 'The War of the Worlds'."
        },
        {
            "year": 1939,
            "event": "'The Wizard of Oz' is released."
        },
        {
            "year": 1940,
            "event": "Bugs Bunny makes his official debut in 'A Wild Hare'."
        },
        {
            "year": 1941,
            "event": "'Citizen Kane' is released."
        },
        {
            "year": 1942,
            "event": "'Casablanca' premieres."
        },
        {
            "year": 1946,
            "event": "Cannes Film Festival is held for the first time."
        },
        {
            "year": 1947,
            "event": "The Tony Awards are held for the first time."
        },
        {
            "year": 1948,
            "event": "Ed Sullivan Show premieres on CBS."
        },
        {
            "year": 1949,
            "event": "The first Emmy Awards are presented."
        },
        {
            "year": 1951,
            "event": "'I Love Lucy' premieres on television."
        },
        {
            "year": 1952,
            "event": "'Singin' in the Rain' is released."
        },
        {
            "year": 1953,
            "event": "Playboy magazine publishes its first issue."
        },
        {
            "year": 1954,
            "event": "Godzilla makes his first appearance in film."
        },
        {
            "year": 1955,
            "event": "Disneyland opens in Anaheim, California."
        },
        {
            "year": 1956,
            "event": "Elvis Presley releases his debut album."
        },
        {
            "year": 1958,
            "event": "The first Grammy Awards are held."
        },
        {
            "year": 1959,
            "event": "The Twilight Zone premieres on television."
        },
        {
            "year": 1960,
            "event": "Alfred Hitchcock's 'Psycho' is released."
        },
        {
            "year": 1961,
            "event": "'West Side Story' film adaptation is released."
        },
        {
            "year": 1962,
            "event": "The first James Bond film, 'Dr. No', premieres."
        },
        {
            "year": 1963,
            "event": "'Doctor Who' debuts on BBC television."
        },
        {
            "year": 1964,
            "event": "The Beatles make their first appearance on The Ed Sullivan Show."
        },
        {
            "year": 1965,
            "event": "'The Sound of Music' is released in theaters."
        },
        {
            "year": 1966,
            "event": "'Star Trek' premieres on NBC."
        },
        {
            "year": 1967,
            "event": "The first Super Bowl is played."
        },
        {
            "year": 1968,
            "event": "'2001: A Space Odyssey' is released."
        },
        {
            "year": 1969,
            "event": "Woodstock Music & Art Fair is held."
        },
        {
            "year": 1971,
            "event": "Walt Disney World opens in Florida."
        },
        {
            "year": 1972,
            "event": "'The Godfather' is released."
        },
        {
            "year": 1973,
            "event": "'The Exorcist' is released."
        },
        {
            "year": 1974,
            "event": "Dungeons & Dragons is published."
        },
        {
            "year": 1975,
            "event": "'Jaws' becomes the first modern summer blockbuster."
        },
        {
            "year": 1976,
            "event": "The Muppet Show premieres."
        },
        {
            "year": 1977,
            "event": "'Star Wars' is released in theaters."
        },
        {
            "year": 1978,
            "event": "'Space Invaders' arcade game is released."
        },
        {
            "year": 1979,
            "event": "Sony releases the Walkman."
        },
        {
            "year": 1980,
            "event": "Pac-Man is released in arcades."
        },
        {
            "year": 1981,
            "event": "MTV launches on cable television."
        },
        {
            "year": 1982,
            "event": "Michael Jackson's 'Thriller' is released."
        },
        {
            "year": 1983,
            "event": "The Nintendo Entertainment System (Famicom) launches in Japan."
        },
        {
            "year": 1984,
            "event": "Apple's '1984' Macintosh commercial airs during Super Bowl XVIII."
        },
        {
            "year": 1985,
            "event": "Super Mario Bros. is released for the NES."
        },
        {
            "year": 1986,
            "event": "'The Phantom of the Opera' opens in London's West End."
        },
        {
            "year": 1987,
            "event": "'The Simpsons' debut as shorts on The Tracey Ullman Show."
        },
        {
            "year": 1989,
            "event": "The Game Boy is released by Nintendo."
        },
        {
            "year": 1990,
            "event": "'The Fresh Prince of Bel-Air' premieres."
        },
        {
            "year": 1991,
            "event": "Nirvana releases 'Nevermind'."
        },
        {
            "year": 1993,
            "event": "'Jurassic Park' makes pioneering use of CGI."
        },
        {
            "year": 1994,
            "event": "Sony PlayStation launches in Japan."
        },
        {
            "year": 1995,
            "event": "'Toy Story', the first entirely computer-animated feature film, is released."
        },
        {
            "year": 1996,
            "event": "'Pokemon Red and Green' are released in Japan."
        },
        {
            "year": 1997,
            "event": "'Titanic' is released."
        },
        {
            "year": 1998,
            "event": "'The Legend of Zelda: Ocarina of Time' is released."
        },
        {
            "year": 1999,
            "event": "'The Matrix' is released in theaters."
        },
        {
            "year": 2000,
            "event": "The PlayStation 2 is released."
        },
        {
            "year": 2001,
            "event": "The first iPod is released by Apple."
        },
        {
            "year": 2002,
            "event": "'American Idol' debuts on Fox."
        },
        {
            "year": 2003,
            "event": "Steam digital distribution platform is launched by Valve."
        },
        {
            "year": 2004,
            "event": "'World of Warcraft' is released."
        },
        {
            "year": 2005,
            "event": "YouTube is launched."
        },
        {
            "year": 2006,
            "event": "The Nintendo Wii is released."
        },
        {
            "year": 2007,
            "event": "Netflix introduces streaming video."
        },
        {
            "year": 2008,
            "event": "'Iron Man' kicks off the Marvel Cinematic Universe."
        },
        {
            "year": 2009,
            "event": "'Avatar' is released and becomes the highest-grossing film of all time."
        },
        {
            "year": 2010,
            "event": "Instagram is launched."
        },
        {
            "year": 2011,
            "event": "'Game of Thrones' premieres on HBO."
        },
        {
            "year": 2012,
            "event": "'The Avengers' is released in theaters."
        },
        {
            "year": 2013,
            "event": "'Grand Theft Auto V' is released, breaking sales records."
        },
        {
            "year": 2014,
            "event": "Amazon acquires Twitch."
        },
        {
            "year": 2015,
            "event": "'Hamilton' premieres on Broadway."
        },
        {
            "year": 2016,
            "event": "'Pokemon Go' is released and becomes a global phenomenon."
        },
        {
            "year": 2017,
            "event": "The Nintendo Switch is released worldwide."
        }
    ],
    "Business": [
        {
            "year": 1555,
            "event": "The Muscovy Company, the first major English joint-stock trading company, is chartered."
        },
        {
            "year": 1599,
            "event": "The East India Company (EIC) is founded in London to trade in the Indian Ocean region."
        },
        {
            "year": 1602,
            "event": "The Dutch East India Company (VOC) is established, becoming the first multinational corporation."
        },
        {
            "year": 1694,
            "event": "The Bank of England is founded to act as the English Government's banker."
        },
        {
            "year": 1776,
            "event": "Adam Smith publishes 'The Wealth of Nations', a foundational text in classical economics."
        },
        {
            "year": 1792,
            "event": "The Buttonwood Agreement is signed, laying the foundation for the New York Stock Exchange."
        },
        {
            "year": 1825,
            "event": "The Stockton and Darlington Railway opens, the world's first public railway to use steam locomotives, boosting trade."
        },
        {
            "year": 1837,
            "event": "Procter & Gamble is founded by William Procter and James Gamble in Cincinnati, Ohio."
        },
        {
            "year": 1850,
            "event": "Lehman Brothers is founded as a general merchandise store in Montgomery, Alabama."
        },
        {
            "year": 1851,
            "event": "Western Union is founded as The New York and Mississippi Valley Printing Telegraph Company."
        },
        {
            "year": 1865,
            "event": "Nokia is founded as a single paper mill operation in southwestern Finland."
        },
        {
            "year": 1870,
            "event": "John D. Rockefeller incorporates Standard Oil, which comes to dominate the oil industry."
        },
        {
            "year": 1873,
            "event": "The Panic of 1873 triggers a severe international economic depression."
        },
        {
            "year": 1886,
            "event": "The Coca-Cola Company is established after John Stith Pemberton invents the beverage."
        },
        {
            "year": 1889,
            "event": "Nintendo is founded in Kyoto, Japan, to produce hanafuda playing cards."
        },
        {
            "year": 1892,
            "event": "General Electric is formed through the merger of Edison General Electric and Thomson-Houston Electric Company."
        },
        {
            "year": 1896,
            "event": "The Dow Jones Industrial Average is first published by Charles Dow."
        },
        {
            "year": 1901,
            "event": "J.P. Morgan creates United States Steel Corporation, the world's first billion-dollar company."
        },
        {
            "year": 1903,
            "event": "The Ford Motor Company is incorporated by Henry Ford and investors."
        },
        {
            "year": 1906,
            "event": "The Pure Food and Drug Act is passed in the US, regulating business practices in the food and pharmaceutical industries."
        },
        {
            "year": 1907,
            "event": "The Panic of 1907 severely damages the US economy, leading to the creation of the Federal Reserve System."
        },
        {
            "year": 1911,
            "event": "The Supreme Court orders the dissolution of Standard Oil under the Sherman Antitrust Act."
        },
        {
            "year": 1913,
            "event": "The Federal Reserve System is established in the United States."
        },
        {
            "year": 1914,
            "event": "Thomas Watson Sr. joins the Computing-Tabulating-Recording Company, later renamed IBM."
        },
        {
            "year": 1919,
            "event": "The Walt Disney Company is founded as the Disney Brothers Cartoon Studio."
        },
        {
            "year": 1923,
            "event": "Time magazine is first published by Briton Hadden and Henry Luce."
        },
        {
            "year": 1927,
            "event": "Pan American World Airways is founded as a scheduled air mail and passenger service operating between Florida and Cuba."
        },
        {
            "year": 1929,
            "event": "The Wall Street Crash triggers the Great Depression."
        },
        {
            "year": 1930,
            "event": "Unilever is formed by the merger of Margarine Unie and Lever Brothers."
        },
        {
            "year": 1933,
            "event": "The Glass-Steagall Act is passed in the US, separating commercial and investment banking."
        },
        {
            "year": 1937,
            "event": "Toyota Motor Corporation is founded by Kiichiro Toyoda as a spinoff from his father's company to create automobiles."
        },
        {
            "year": 1938,
            "event": "Samsung is founded by Lee Byung-chul in Daegu, Japanese Korea, as a trading company."
        },
        {
            "year": 1940,
            "event": "McDonald's is founded as a restaurant in San Bernardino, California."
        },
        {
            "year": 1944,
            "event": "The Bretton Woods system establishes international financial rules and creates the IMF and World Bank."
        },
        {
            "year": 1945,
            "event": "Kaiser Permanente, one of the largest modern healthcare organizations, is opened to the public."
        },
        {
            "year": 1946,
            "event": "Sony is founded as Tokyo Tsushin Kogyo in a department store building in Tokyo."
        },
        {
            "year": 1947,
            "event": "The General Agreement on Tariffs and Trade (GATT) is signed."
        },
        {
            "year": 1950,
            "event": "Frank McNamara and Ralph Schneider introduce the Diners Club card, the world's first multipurpose charge card."
        },
        {
            "year": 1953,
            "event": "Hugh Hefner publishes the first issue of Playboy magazine."
        },
        {
            "year": 1955,
            "event": "Ray Kroc opens his first franchised McDonald's restaurant in Des Plaines, Illinois."
        },
        {
            "year": 1958,
            "event": "Bank of America launches the BankAmericard, the first successful modern credit card, later known as Visa."
        },
        {
            "year": 1962,
            "event": "Sam Walton opens the first Walmart store in Rogers, Arkansas."
        },
        {
            "year": 1964,
            "event": "Phil Knight and Bill Bowerman found Blue Ribbon Sports, which later becomes Nike."
        },
        {
            "year": 1968,
            "event": "Intel Corporation is founded by Gordon Moore and Robert Noyce."
        },
        {
            "year": 1969,
            "event": "The first ATM in the United States is installed by Chemical Bank in New York."
        },
        {
            "year": 1971,
            "event": "The NASDAQ, the world's first electronic stock market, begins trading."
        },
        {
            "year": 1973,
            "event": "The 1973 oil crisis leads to soaring fuel prices and major economic shifts worldwide."
        },
        {
            "year": 1974,
            "event": "The first commercial use of a UPC barcode scanner occurs at a Marsh supermarket in Ohio."
        },
        {
            "year": 1975,
            "event": "Bill Gates and Paul Allen found Microsoft in Albuquerque, New Mexico."
        },
        {
            "year": 1976,
            "event": "Steve Jobs, Steve Wozniak, and Ronald Wayne establish Apple Computer, Inc."
        },
        {
            "year": 1977,
            "event": "Oracle Corporation is founded by Larry Ellison, Bob Miner, and Ed Oates."
        },
        {
            "year": 1979,
            "event": "The Sony Walkman is introduced, revolutionizing the portable consumer electronics market."
        },
        {
            "year": 1980,
            "event": "The United States initiates the deregulation of the trucking and airline industries."
        },
        {
            "year": 1981,
            "event": "MTV launches, profoundly influencing the music and television industries."
        },
        {
            "year": 1982,
            "event": "The AT&T settlement forces the breakup of the Bell System monopoly."
        },
        {
            "year": 1984,
            "event": "Apple introduces the Macintosh computer with a famous Super Bowl commercial."
        },
        {
            "year": 1985,
            "event": "Blockbuster Video opens its first store in Dallas, Texas."
        },
        {
            "year": 1987,
            "event": "'Black Monday' occurs as stock markets around the world crash."
        },
        {
            "year": 1989,
            "event": "Tim Berners-Lee invents the World Wide Web, paving the way for e-commerce."
        },
        {
            "year": 1990,
            "event": "The East German Mark is abolished and replaced by the Deutsche Mark as German reunification nears."
        },
        {
            "year": 1994,
            "event": "Jeff Bezos founds Amazon in Bellevue, Washington, initially as an online bookstore."
        },
        {
            "year": 1995,
            "event": "Pierre Omidyar launches AuctionWeb, which later becomes eBay."
        },
        {
            "year": 1997,
            "event": "Netflix is founded by Reed Hastings and Marc Randolph as a mail-based rental business."
        },
        {
            "year": 1998,
            "event": "Larry Page and Sergey Brin found Google in a garage in Menlo Park, California."
        },
        {
            "year": 1999,
            "event": "The Gramm-Leach-Bliley Act repeals parts of the Glass-Steagall Act in the US."
        },
        {
            "year": 2000,
            "event": "The Dot-com bubble bursts, causing many internet-based companies to fail."
        },
        {
            "year": 2001,
            "event": "Enron files for bankruptcy in one of the largest corporate accounting scandals in history."
        },
        {
            "year": 2002,
            "event": "SpaceX is founded by Elon Musk with the goal of reducing space transportation costs."
        },
        {
            "year": 2003,
            "event": "Tesla Motors is incorporated by Martin Eberhard and Marc Tarpenning."
        },
        {
            "year": 2004,
            "event": "Mark Zuckerberg and his college roommates launch Facebook."
        },
        {
            "year": 2005,
            "event": "YouTube is founded by Chad Hurley, Steve Chen, and Jawed Karim."
        },
        {
            "year": 2006,
            "event": "Twitter is created by Jack Dorsey, Noah Glass, Biz Stone, and Evan Williams."
        },
        {
            "year": 2007,
            "event": "Apple releases the first iPhone, disrupting the mobile phone and personal computing markets."
        },
        {
            "year": 2008,
            "event": "Lehman Brothers files for bankruptcy, marking the climax of the global financial crisis."
        },
        {
            "year": 2009,
            "event": "Bitcoin, the first decentralized cryptocurrency, is launched by Satoshi Nakamoto."
        },
        {
            "year": 2010,
            "event": "Instagram is launched by Kevin Systrom and Mike Krieger."
        },
        {
            "year": 2011,
            "event": "Occupy Wall Street protests begin in New York City, drawing attention to economic inequality."
        },
        {
            "year": 2012,
            "event": "Facebook holds its initial public offering, one of the largest in technology history."
        },
        {
            "year": 2013,
            "event": "Jeff Bezos purchases The Washington Post newspaper for $250 million."
        },
        {
            "year": 2014,
            "event": "Alibaba Group holds its IPO on the New York Stock Exchange, raising a record $25 billion."
        },
        {
            "year": 2015,
            "event": "The Paris Agreement on climate change is adopted, pushing global businesses toward sustainability."
        },
        {
            "year": 2016,
            "event": "Microsoft acquires LinkedIn for $26.2 billion."
        },
        {
            "year": 2017,
            "event": "Amazon acquires Whole Foods Market for $13.7 billion."
        },
        {
            "year": 2018,
            "event": "Apple becomes the first publicly traded US company to reach a $1 trillion market capitalization."
        },
        {
            "year": 2019,
            "event": "Saudi Aramco becomes the world's most valuable public company after its IPO."
        },
        {
            "year": 2020,
            "event": "Global stock markets crash and then rapidly recover amidst the onset of the COVID-19 pandemic."
        },
        {
            "year": 2021,
            "event": "Retail investors coordinate on Reddit to drive up the stock price of GameStop (GME)."
        },
        {
            "year": 2022,
            "event": "Elon Musk acquires Twitter for $44 billion and takes the company private."
        },
        {
            "year": 2023,
            "event": "The collapse of Silicon Valley Bank becomes the second-largest bank failure in US history."
        },
        {
            "year": 2024,
            "event": "Major tech companies heavily invest and launch numerous Generative AI tools and services in a global AI boom."
        }
    ],
    "Technology": [
        {
            "event": "Johannes Gutenberg invents the printing press.",
            "year": 1440
        },
        {
            "event": "Zacharias Janssen invents the compound microscope.",
            "year": 1590
        },
        {
            "event": "Hans Lippershey invents the telescope.",
            "year": 1608
        },
        {
            "event": "Cornelis Drebbel invents the first navigable submarine.",
            "year": 1620
        },
        {
            "event": "Blaise Pascal invents the mechanical calculator.",
            "year": 1642
        },
        {
            "event": "Evangelista Torricelli invents the barometer.",
            "year": 1643
        },
        {
            "event": "Otto von Guericke invents the air pump.",
            "year": 1650
        },
        {
            "event": "Christiaan Huygens invents the pendulum clock.",
            "year": 1656
        },
        {
            "event": "Thomas Savery patents the first crude steam engine.",
            "year": 1698
        },
        {
            "event": "Daniel Gabriel Fahrenheit invents the alcohol thermometer.",
            "year": 1709
        },
        {
            "event": "Thomas Newcomen builds the first practical steam engine.",
            "year": 1712
        },
        {
            "event": "Daniel Gabriel Fahrenheit invents the mercury thermometer.",
            "year": 1714
        },
        {
            "event": "John Kay invents the flying shuttle.",
            "year": 1733
        },
        {
            "event": "Benjamin Franklin invents the lightning rod.",
            "year": 1752
        },
        {
            "event": "James Hargreaves invents the spinning jenny.",
            "year": 1764
        },
        {
            "event": "James Watt patents his improved steam engine.",
            "year": 1769
        },
        {
            "event": "David Bushnell invents the Turtle, a submersible.",
            "year": 1776
        },
        {
            "event": "The Montgolfier brothers launch the first hot air balloon.",
            "year": 1783
        },
        {
            "event": "Edmund Cartwright invents the power loom.",
            "year": 1785
        },
        {
            "event": "Eli Whitney invents the cotton gin.",
            "year": 1793
        },
        {
            "event": "Alessandro Volta invents the voltaic pile (battery).",
            "year": 1800
        },
        {
            "event": "Richard Trevithick builds the first full-scale working railway steam locomotive.",
            "year": 1804
        },
        {
            "event": "Robert Fulton builds the first commercially successful steamboat.",
            "year": 1807
        },
        {
            "event": "George Stephenson builds the first practical steam locomotive.",
            "year": 1814
        },
        {
            "event": "Nicéphore Niépce takes the first permanent photograph.",
            "year": 1826
        },
        {
            "event": "Michael Faraday discovers electromagnetic induction.",
            "year": 1831
        },
        {
            "event": "Charles Babbage designs the Analytical Engine.",
            "year": 1834
        },
        {
            "event": "Samuel Morse patents the telegraph.",
            "year": 1837
        },
        {
            "event": "Charles Goodyear invents vulcanized rubber.",
            "year": 1839
        },
        {
            "event": "Samuel Morse sends the first public telegraph message.",
            "year": 1844
        },
        {
            "event": "Elias Howe patents the sewing machine.",
            "year": 1846
        },
        {
            "event": "Elisha Otis invents the safety elevator.",
            "year": 1852
        },
        {
            "event": "The Bessemer process for steel production is patented.",
            "year": 1855
        },
        {
            "event": "Gaston Planté invents the lead-acid battery.",
            "year": 1859
        },
        {
            "event": "Richard Gatling patents the Gatling gun.",
            "year": 1862
        },
        {
            "event": "Alfred Nobel invents dynamite.",
            "year": 1866
        },
        {
            "event": "Christopher Latham Sholes patents the modern typewriter.",
            "year": 1868
        },
        {
            "event": "Alexander Graham Bell patents the telephone.",
            "year": 1876
        },
        {
            "event": "Thomas Edison invents the phonograph.",
            "year": 1877
        },
        {
            "event": "Thomas Edison patents a commercially practical incandescent light bulb.",
            "year": 1879
        },
        {
            "event": "Hiram Maxim invents the first fully automatic machine gun.",
            "year": 1884
        },
        {
            "event": "Karl Benz builds the first practical automobile powered by an internal combustion engine.",
            "year": 1885
        },
        {
            "event": "Nikola Tesla patents the alternating current (AC) induction motor.",
            "year": 1888
        },
        {
            "event": "Wilhelm Röntgen discovers X-rays.",
            "year": 1895
        },
        {
            "event": "Guglielmo Marconi patents a wireless telegraph system.",
            "year": 1896
        },
        {
            "event": "Guglielmo Marconi successfully transmits a radio signal across the Atlantic.",
            "year": 1901
        },
        {
            "event": "The Wright brothers achieve the first powered, controlled, and sustained heavier-than-air flight.",
            "year": 1903
        },
        {
            "event": "John Ambrose Fleming invents the vacuum tube diode.",
            "year": 1904
        },
        {
            "event": "Lee de Forest invents the triode vacuum tube.",
            "year": 1906
        },
        {
            "event": "Henry Ford introduces the Model T automobile.",
            "year": 1908
        },
        {
            "event": "Henry Ford introduces the first moving assembly line for cars.",
            "year": 1913
        },
        {
            "event": "The first commercial radio broadcast is made by KDKA in Pittsburgh.",
            "year": 1920
        },
        {
            "event": "Robert Goddard launches the first liquid-fueled rocket.",
            "year": 1926
        },
        {
            "event": "Philo Farnsworth transmits the first all-electronic television image.",
            "year": 1927
        },
        {
            "event": "Alexander Fleming discovers penicillin.",
            "year": 1928
        },
        {
            "event": "Frank Whittle patents the jet engine.",
            "year": 1930
        },
        {
            "event": "Robert Watson-Watt patents radar.",
            "year": 1935
        },
        {
            "event": "Chester Carlson invents the photocopier (xerography).",
            "year": 1938
        },
        {
            "event": "Igor Sikorsky develops the first successful helicopter.",
            "year": 1939
        },
        {
            "event": "Enrico Fermi oversees the first controlled nuclear chain reaction.",
            "year": 1942
        },
        {
            "event": "The first atomic bomb is detonated (Trinity test).",
            "year": 1945
        },
        {
            "event": "ENIAC, the first general-purpose electronic digital computer, is dedicated.",
            "year": 1946
        },
        {
            "event": "John Bardeen, Walter Brattain, and William Shockley invent the transistor.",
            "year": 1947
        },
        {
            "event": "UNIVAC I, the first commercial computer, is delivered to the US Census Bureau.",
            "year": 1951
        },
        {
            "event": "The first nuclear power plant to generate electricity for a power grid starts operation in Obninsk.",
            "year": 1954
        },
        {
            "event": "Jonas Salk's polio vaccine is declared safe and effective.",
            "year": 1955
        },
        {
            "event": "The Soviet Union launches Sputnik 1, the first artificial Earth satellite.",
            "year": 1957
        },
        {
            "event": "Jack Kilby and Robert Noyce independently invent the integrated circuit.",
            "year": 1958
        },
        {
            "event": "Theodore Maiman builds the first working laser.",
            "year": 1960
        },
        {
            "event": "Yuri Gagarin becomes the first human in space.",
            "year": 1961
        },
        {
            "event": "IBM announces the System/360 family of mainframe computers.",
            "year": 1964
        },
        {
            "event": "Douglas Engelbart demonstrates the computer mouse and graphical user interface.",
            "year": 1968
        },
        {
            "event": "ARPANET, the precursor to the Internet, is established.",
            "year": 1969
        },
        {
            "event": "Intel introduces the 4004, the first commercial microprocessor.",
            "year": 1971
        },
        {
            "event": "Martin Cooper makes the first call on a portable cellular phone.",
            "year": 1973
        },
        {
            "event": "The Altair 8800, sparking the microcomputer revolution, is released.",
            "year": 1975
        },
        {
            "event": "Apple Computer is founded by Steve Jobs and Steve Wozniak.",
            "year": 1976
        },
        {
            "event": "Sony introduces the Walkman portable cassette player.",
            "year": 1979
        },
        {
            "event": "IBM introduces the IBM Personal Computer (PC).",
            "year": 1981
        },
        {
            "event": "The first commercial compact disc (CD) is produced.",
            "year": 1982
        },
        {
            "event": "The ARPANET transitions to TCP/IP, marking the birth of the modern Internet.",
            "year": 1983
        },
        {
            "event": "Apple introduces the Macintosh computer.",
            "year": 1984
        },
        {
            "event": "Tim Berners-Lee proposes the World Wide Web.",
            "year": 1989
        },
        {
            "event": "The first web server and web browser are created.",
            "year": 1990
        },
        {
            "event": "Linus Torvalds releases the first version of the Linux kernel.",
            "year": 1991
        },
        {
            "event": "The Mosaic web browser is released, popularizing the World Wide Web.",
            "year": 1993
        },
        {
            "event": "The first smartphone, the IBM Simon, is released.",
            "year": 1994
        },
        {
            "event": "The DVD format is announced.",
            "year": 1995
        },
        {
            "event": "Dolly the sheep becomes the first mammal cloned from an adult somatic cell.",
            "year": 1996
        },
        {
            "event": "IBM's Deep Blue defeats world chess champion Garry Kasparov.",
            "year": 1997
        }
    ],
    "Cinema": [
        {
            "year": 1888,
            "event": "Roundhay Garden Scene, the world's earliest surviving motion-picture film, is recorded."
        },
        {
            "year": 1894,
            "event": "Thomas Edison's Kinetoscope is given its first public exhibition."
        },
        {
            "year": 1895,
            "event": "The Lumière brothers hold their first public screening of short films in Paris."
        },
        {
            "year": 1896,
            "event": "Georges Méliès establishes the Star Film Company, pioneering special effects."
        },
        {
            "year": 1897,
            "event": "The first recorded film in Japan is made, marking the beginning of Japanese cinema."
        },
        {
            "year": 1899,
            "event": "Georges Méliès releases the historical film 'Cleopatra'."
        },
        {
            "year": 1902,
            "event": "'A Trip to the Moon' (Le Voyage dans la Lune) by Georges Méliès is released."
        },
        {
            "year": 1903,
            "event": "'The Great Train Robbery', an early milestone in narrative filmmaking, is released."
        },
        {
            "year": 1906,
            "event": "The world's first feature-length film, 'The Story of the Kelly Gang', is released in Australia."
        },
        {
            "year": 1908,
            "event": "Émile Cohl creates 'Fantasmagorie', one of the first fully animated films."
        },
        {
            "year": 1911,
            "event": "The first movie studio in Hollywood, Nestor Studio, is established."
        },
        {
            "year": 1914,
            "event": "Charlie Chaplin's Little Tramp character makes his debut in 'Kid Auto Races at Venice'."
        },
        {
            "year": 1915,
            "event": "D. W. Griffith's highly controversial epic 'The Birth of a Nation' is released."
        },
        {
            "year": 1919,
            "event": "United Artists is founded by Charlie Chaplin, Mary Pickford, Douglas Fairbanks, and D. W. Griffith."
        },
        {
            "year": 1920,
            "event": "'The Cabinet of Dr. Caligari', a quintessential work of German Expressionist cinema, is released."
        },
        {
            "year": 1922,
            "event": "'Nosferatu', an unauthorized adaptation of Bram Stoker's Dracula, premieres."
        },
        {
            "year": 1923,
            "event": "The Hollywood Sign (originally 'Hollywoodland') is erected in Los Angeles."
        },
        {
            "year": 1925,
            "event": "Sergei Eisenstein's 'Battleship Potemkin' introduces revolutionary Soviet montage techniques."
        },
        {
            "year": 1927,
            "event": "'The Jazz Singer' becomes the first feature-length motion picture with synchronized dialogue."
        },
        {
            "year": 1928,
            "event": "Walt Disney releases 'Steamboat Willie', introducing Mickey Mouse to audiences."
        },
        {
            "year": 1929,
            "event": "The first Academy Awards ceremony is held at the Hollywood Roosevelt Hotel."
        },
        {
            "year": 1930,
            "event": "The Motion Picture Production Code (Hays Code) is introduced, though not strictly enforced yet."
        },
        {
            "year": 1931,
            "event": "Fritz Lang's first sound film, 'M', starring Peter Lorre, is released."
        },
        {
            "year": 1933,
            "event": "'King Kong' premieres, showcasing pioneering stop-motion animation by Willis O'Brien."
        },
        {
            "year": 1935,
            "event": "'Becky Sharp' becomes the first feature film shot entirely in three-strip Technicolor."
        },
        {
            "year": 1937,
            "event": "'Snow White and the Seven Dwarfs', the first full-length cel animated feature in history, is released."
        },
        {
            "year": 1939,
            "event": "'The Wizard of Oz' and 'Gone with the Wind' are released in a landmark year for Hollywood."
        },
        {
            "year": 1940,
            "event": "Charlie Chaplin's first true sound film, 'The Great Dictator', satirizes Adolf Hitler."
        },
        {
            "year": 1941,
            "event": "Orson Welles' 'Citizen Kane' is released, revolutionizing cinematography and narrative structure."
        },
        {
            "year": 1942,
            "event": "'Casablanca', starring Humphrey Bogart and Ingrid Bergman, premieres in New York City."
        },
        {
            "year": 1944,
            "event": "The Golden Globe Awards are held for the first time."
        },
        {
            "year": 1946,
            "event": "The first Cannes Film Festival is held after being delayed by World War II."
        },
        {
            "year": 1948,
            "event": "The US Supreme Court's 'Paramount Decision' forces studios to sell off their theater chains."
        },
        {
            "year": 1950,
            "event": "'Rashomon' by Akira Kurosawa introduces Japanese cinema to a global audience."
        },
        {
            "year": 1952,
            "event": "The first Cinerama film, 'This Is Cinerama', premieres, starting a widescreen craze."
        },
        {
            "year": 1953,
            "event": "'The Robe' is released, becoming the first film released in the widescreen process CinemaScope."
        },
        {
            "year": 1954,
            "event": "'Godzilla' is released in Japan, creating the kaiju genre."
        },
        {
            "year": 1955,
            "event": "James Dean stars in 'Rebel Without a Cause' shortly before his tragic death."
        },
        {
            "year": 1957,
            "event": "Ingmar Bergman releases 'The Seventh Seal', a masterpiece of Swedish cinema."
        },
        {
            "year": 1958,
            "event": "Alfred Hitchcock's 'Vertigo' is released to mixed reviews before later being recognized as a masterpiece."
        },
        {
            "year": 1959,
            "event": "The French New Wave explodes internationally with the release of 'The 400 Blows'."
        },
        {
            "year": 1960,
            "event": "Alfred Hitchcock's 'Psycho' shocks audiences and changes the horror genre forever."
        },
        {
            "year": 1962,
            "event": "'Dr. No' introduces Sean Connery as James Bond, launching the longest-running film franchise."
        },
        {
            "year": 1964,
            "event": "'A Hard Day's Night' starring The Beatles redefines the musical film genre."
        },
        {
            "year": 1965,
            "event": "'The Sound of Music' is released, becoming one of the highest-grossing films of all time."
        },
        {
            "year": 1966,
            "event": "The spaghetti western 'The Good, the Bad and the Ugly' cements Clint Eastwood's stardom."
        },
        {
            "year": 1968,
            "event": "Stanley Kubrick's '2001: A Space Odyssey' redefines science fiction cinema."
        },
        {
            "year": 1969,
            "event": "'Easy Rider' heralds the arrival of the New Hollywood era of independent-minded filmmaking."
        },
        {
            "year": 1971,
            "event": "'A Clockwork Orange' is released, sparking intense controversy over its depiction of violence."
        },
        {
            "year": 1972,
            "event": "'The Godfather' is released, setting new standards for the gangster genre."
        },
        {
            "year": 1973,
            "event": "'Enter the Dragon' brings Bruce Lee global superstardom shortly after his death."
        },
        {
            "year": 1974,
            "event": "'The Texas Chain Saw Massacre' helps define the modern slasher film."
        },
        {
            "year": 1975,
            "event": "'Jaws' becomes the first modern summer blockbuster."
        },
        {
            "year": 1976,
            "event": "The introduction of the Steadicam revolutionizes camera movement in 'Bound for Glory'."
        },
        {
            "year": 1977,
            "event": "'Star Wars' is released, becoming a cultural phenomenon and changing the film industry."
        },
        {
            "year": 1979,
            "event": "'Alien' is released, blending science fiction and horror to immense success."
        },
        {
            "year": 1980,
            "event": "'The Empire Strikes Back' expands the Star Wars universe and deepens blockbuster storytelling."
        },
        {
            "year": 1982,
            "event": "'Blade Runner' defines the cyberpunk aesthetic on film."
        },
        {
            "year": 1984,
            "event": "'The Terminator' launches the career of director James Cameron."
        },
        {
            "year": 1985,
            "event": "'Back to the Future' becomes the highest-grossing film of the year."
        },
        {
            "year": 1986,
            "event": "Studio Ghibli releases 'Castle in the Sky', its first official feature film."
        },
        {
            "year": 1988,
            "event": "'Akira' is released, bringing Japanese anime to mainstream international audiences."
        },
        {
            "year": 1989,
            "event": "Tim Burton's 'Batman' redefines the superhero film genre and blockbuster marketing."
        },
        {
            "year": 1990,
            "event": "'Goodfellas' revitalizes the mobster genre under the direction of Martin Scorsese."
        },
        {
            "year": 1991,
            "event": "'Terminator 2: Judgment Day' features groundbreaking computer-generated imagery."
        },
        {
            "year": 1993,
            "event": "'Jurassic Park' astounds audiences with photorealistic CGI dinosaurs."
        },
        {
            "year": 1994,
            "event": "'Pulp Fiction' wins the Palme d'Or and cements Quentin Tarantino's status as an auteur."
        },
        {
            "year": 1995,
            "event": "'Toy Story' is released as the world's first fully computer-animated feature film."
        },
        {
            "year": 1997,
            "event": "'Titanic' becomes the highest-grossing film of all time and wins 11 Academy Awards."
        },
        {
            "year": 1998,
            "event": "'Saving Private Ryan' revolutionizes the portrayal of combat in war films."
        },
        {
            "year": 1999,
            "event": "'The Matrix' introduces the 'bullet time' visual effect to popular cinema."
        },
        {
            "year": 2000,
            "event": "'Crouching Tiger, Hidden Dragon' becomes an international sensation and martial arts classic."
        },
        {
            "year": 2001,
            "event": "'The Lord of the Rings: The Fellowship of the Ring' begins the critically acclaimed fantasy trilogy."
        },
        {
            "year": 2002,
            "event": "The Academy Award for Best Animated Feature is first presented, won by 'Shrek'."
        },
        {
            "year": 2003,
            "event": "'The Return of the King' sweeps the Oscars, winning all 11 of its nominated categories."
        },
        {
            "year": 2005,
            "event": "YouTube is launched, eventually transforming how video content is distributed and consumed."
        },
        {
            "year": 2007,
            "event": "'No Country for Old Men' wins Best Picture at the Oscars, marking a high point for the Coen Brothers."
        },
        {
            "year": 2008,
            "event": "'The Dark Knight' and 'Iron Man' are released, cementing the dominance of the superhero genre."
        },
        {
            "year": 2009,
            "event": "'Avatar' pioneers modern 3D filmmaking and surpasses Titanic as the highest-grossing film."
        },
        {
            "year": 2010,
            "event": "'Inception' brings complex, original science fiction to blockbuster audiences."
        },
        {
            "year": 2012,
            "event": "'The Avengers' proves the viability of interconnected cinematic universes."
        },
        {
            "year": 2013,
            "event": "'Frozen' becomes a global cultural phenomenon and the highest-grossing animated film at the time."
        },
        {
            "year": 2014,
            "event": "'Boyhood' is released, having been filmed over 12 years with the same cast."
        },
        {
            "year": 2015,
            "event": "'Star Wars: The Force Awakens' successfully revives the legendary franchise."
        },
        {
            "year": 2016,
            "event": "The critically acclaimed 'Moonlight' premieres, later winning Best Picture."
        },
        {
            "year": 2018,
            "event": "'Black Panther' becomes a massive cultural milestone and the first superhero film nominated for Best Picture."
        },
        {
            "year": 2019,
            "event": "'Parasite' premieres at Cannes, later becoming the first non-English language film to win Best Picture."
        },
        {
            "year": 2020,
            "event": "The COVID-19 pandemic causes unprecedented global cinema closures and film delays."
        },
        {
            "year": 2022,
            "event": "'Top Gun: Maverick' becomes a massive hit, credited with revitalizing the theatrical experience."
        },
        {
            "year": 2023,
            "event": "The 'Barbenheimer' phenomenon takes over global pop culture, with 'Barbie' and 'Oppenheimer' opening on the same day."
        }
    ],
    "Science": [
        {
            "event": "Copernicus publishes De revolutionibus orbium coelestium",
            "year": 1543
        },
        {
            "event": "William Gilbert publishes De Magnete",
            "year": 1600
        },
        {
            "event": "Johannes Kepler publishes Astronomia nova",
            "year": 1609
        },
        {
            "event": "Galileo Galilei publishes Sidereus Nuncius",
            "year": 1610
        },
        {
            "event": "William Harvey publishes Exercitatio Anatomica de Motu Cordis et Sanguinis in Animalibus",
            "year": 1628
        },
        {
            "event": "Galileo publishes Dialogue Concerning the Two Chief World Systems",
            "year": 1632
        },
        {
            "event": "Robert Boyle formulates Boyle's law",
            "year": 1662
        },
        {
            "event": "Robert Hooke publishes Micrographia",
            "year": 1665
        },
        {
            "event": "Ole Rømer makes the first quantitative measurement of the speed of light",
            "year": 1676
        },
        {
            "event": "Isaac Newton publishes Philosophiæ Naturalis Principia Mathematica",
            "year": 1687
        },
        {
            "event": "Carl Linnaeus publishes Systema Naturae",
            "year": 1735
        },
        {
            "event": "Benjamin Franklin conducts his kite experiment",
            "year": 1752
        },
        {
            "event": "Mikhail Lomonosov discovers the atmosphere of Venus",
            "year": 1761
        },
        {
            "event": "Joseph Priestley discovers oxygen",
            "year": 1774
        },
        {
            "event": "William Herschel discovers Uranus",
            "year": 1781
        },
        {
            "event": "Charles-Augustin de Coulomb introduces Coulomb's law",
            "year": 1785
        },
        {
            "event": "Antoine Lavoisier publishes Elements of Chemistry",
            "year": 1789
        },
        {
            "event": "Edward Jenner develops the smallpox vaccine",
            "year": 1796
        },
        {
            "event": "Alessandro Volta invents the voltaic pile",
            "year": 1800
        },
        {
            "event": "Thomas Young conducts the double-slit experiment",
            "year": 1801
        },
        {
            "event": "John Dalton proposes his atomic theory",
            "year": 1803
        },
        {
            "event": "Amedeo Avogadro proposes Avogadro's law",
            "year": 1811
        },
        {
            "event": "Hans Christian Ørsted discovers electromagnetism",
            "year": 1820
        },
        {
            "event": "Nicolas Léonard Sadi Carnot describes the Carnot cycle",
            "year": 1824
        },
        {
            "event": "Georg Ohm formulates Ohm's law",
            "year": 1827
        },
        {
            "event": "Friedrich Wöhler synthesizes urea",
            "year": 1828
        },
        {
            "event": "Michael Faraday discovers electromagnetic induction",
            "year": 1831
        },
        {
            "event": "Matthias Schleiden and Theodor Schwann formulate cell theory",
            "year": 1839
        },
        {
            "event": "Julius Robert von Mayer proposes the law of conservation of energy",
            "year": 1842
        },
        {
            "event": "Johann Gottfried Galle discovers Neptune",
            "year": 1846
        },
        {
            "event": "Gregor Mendel begins his experiments on plant hybridization",
            "year": 1856
        },
        {
            "event": "Charles Darwin publishes On the Origin of Species",
            "year": 1859
        },
        {
            "event": "Louis Pasteur disproves spontaneous generation",
            "year": 1861
        },
        {
            "event": "James Clerk Maxwell publishes A Dynamical Theory of the Electromagnetic Field",
            "year": 1864
        },
        {
            "event": "Pierre Janssen and Norman Lockyer discover helium",
            "year": 1868
        },
        {
            "event": "Dmitri Mendeleev publishes the periodic table",
            "year": 1869
        },
        {
            "event": "Johannes Diderik van der Waals derives the van der Waals equation",
            "year": 1873
        },
        {
            "event": "Ludwig Boltzmann formulates the statistical definition of entropy",
            "year": 1877
        },
        {
            "event": "Thomas Edison invents a practical incandescent light bulb",
            "year": 1879
        },
        {
            "event": "Robert Koch discovers the bacterium that causes tuberculosis",
            "year": 1882
        },
        {
            "event": "Louis Pasteur successfully tests the rabies vaccine",
            "year": 1885
        },
        {
            "event": "The Michelson–Morley experiment yields a null result for the aether",
            "year": 1887
        },
        {
            "event": "Heinrich Hertz discovers radio waves",
            "year": 1888
        },
        {
            "event": "Wilhelm Röntgen discovers X-rays",
            "year": 1895
        },
        {
            "event": "Henri Becquerel discovers radioactivity",
            "year": 1896
        },
        {
            "event": "J. J. Thomson discovers the electron",
            "year": 1897
        },
        {
            "event": "Marie and Pierre Curie discover polonium and radium",
            "year": 1898
        },
        {
            "event": "Max Planck formulates Planck's law of black-body radiation",
            "year": 1900
        },
        {
            "event": "Karl Landsteiner discovers human blood groups",
            "year": 1901
        },
        {
            "event": "Albert Einstein publishes his Annus Mirabilis papers",
            "year": 1905
        },
        {
            "event": "The Geiger-Marsden experiment is conducted",
            "year": 1909
        },
        {
            "event": "Ernest Rutherford proposes the planetary model of the atom",
            "year": 1911
        },
        {
            "event": "Alfred Wegener proposes continental drift",
            "year": 1912
        },
        {
            "event": "Niels Bohr proposes the Bohr model of the atom",
            "year": 1913
        },
        {
            "event": "Albert Einstein formulates general relativity",
            "year": 1915
        },
        {
            "event": "Arthur Eddington's eclipse expedition confirms general relativity",
            "year": 1919
        },
        {
            "event": "Alexander Friedmann predicts the expansion of the universe",
            "year": 1922
        },
        {
            "event": "Louis de Broglie proposes wave-particle duality",
            "year": 1924
        },
        {
            "event": "Wolfgang Pauli formulates the Pauli exclusion principle",
            "year": 1925
        },
        {
            "event": "Erwin Schrödinger publishes the Schrödinger equation",
            "year": 1926
        },
        {
            "event": "Werner Heisenberg formulates the uncertainty principle",
            "year": 1927
        },
        {
            "event": "Alexander Fleming discovers penicillin",
            "year": 1928
        },
        {
            "event": "Edwin Hubble discovers the expansion of the universe",
            "year": 1929
        },
        {
            "event": "Clyde Tombaugh discovers Pluto",
            "year": 1930
        },
        {
            "event": "James Chadwick discovers the neutron",
            "year": 1932
        },
        {
            "event": "Otto Hahn and Fritz Strassmann discover nuclear fission",
            "year": 1938
        },
        {
            "event": "Enrico Fermi oversees the first controlled nuclear chain reaction",
            "year": 1942
        },
        {
            "event": "Oswald Avery proves DNA is the genetic material",
            "year": 1944
        },
        {
            "event": "The transistor is invented at Bell Labs",
            "year": 1947
        },
        {
            "event": "George Gamow, Ralph Alpher, and Robert Herman propose the Big Bang theory",
            "year": 1948
        },
        {
            "event": "Rosalind Franklin captures Photograph 51 of DNA",
            "year": 1951
        },
        {
            "event": "The Hershey-Chase experiment confirms DNA is the genetic material",
            "year": 1952
        },
        {
            "event": "James Watson and Francis Crick propose the double helix structure of DNA",
            "year": 1953
        },
        {
            "event": "The Soviet Union launches Sputnik 1",
            "year": 1957
        },
        {
            "event": "Theodore Maiman builds the first working laser",
            "year": 1960
        },
        {
            "event": "Yuri Gagarin becomes the first human in space",
            "year": 1961
        },
        {
            "event": "Murray Gell-Mann and George Zweig propose the quark model",
            "year": 1964
        },
        {
            "event": "Arno Penzias and Robert Wilson discover the cosmic microwave background radiation",
            "year": 1965
        },
        {
            "event": "Jocelyn Bell Burnell discovers the first pulsar",
            "year": 1967
        },
        {
            "event": "Apollo 11 lands the first humans on the Moon",
            "year": 1969
        },
        {
            "event": "Stephen Hawking predicts Hawking radiation",
            "year": 1974
        },
        {
            "event": "The Voyager spacecraft are launched",
            "year": 1977
        },
        {
            "event": "Alan Guth proposes cosmic inflation",
            "year": 1980
        },
        {
            "event": "The Scanning Tunneling Microscope is invented",
            "year": 1981
        },
        {
            "event": "Kary Mullis invents the polymerase chain reaction",
            "year": 1983
        },
        {
            "event": "High-temperature superconductivity is discovered",
            "year": 1986
        },
        {
            "event": "The Human Genome Project begins",
            "year": 1990
        },
        {
            "event": "The first exoplanet around a main-sequence star, 51 Pegasi b, is discovered",
            "year": 1995
        },
        {
            "event": "Dolly the sheep becomes the first cloned mammal",
            "year": 1996
        },
        {
            "event": "The accelerated expansion of the universe is discovered",
            "year": 1998
        }
    ],
    "Pop History": [
        {
            "event": "Bob Dylan, born Robert Zimmerman",
            "year": 1941
        },
        {
            "event": "Freddie Mercury, born Farrokh Bulsara",
            "year": 1946
        },
        {
            "event": "Elton John, born Reginald Kenneth Dwight",
            "year": 1947
        },
        {
            "event": "Madonna, born Madonna Louise Ciccone",
            "year": 1958
        },
        {
            "event": "Lady Gaga, born Stefani Joanne Angelina Germanotta",
            "year": 1986
        },
        {
            "event": "Bruno Mars, born Peter Gene Hernandez",
            "year": 1985
        },
        {
            "event": "Miley Cyrus, born Destiny Hope Cyrus",
            "year": 1992
        },
        {
            "event": "Sputnik 1 becomes the first artificial satellite",
            "year": 1957
        },
        {
            "event": "Yuri Gagarin becomes the first human in space",
            "year": 1961
        },
        {
            "event": "Valentina Tereshkova becomes the first woman in space",
            "year": 1963
        },
        {
            "event": "Alexei Leonov performs the first spacewalk",
            "year": 1965
        },
        {
            "event": "Neil Armstrong becomes the first person to walk on the moon",
            "year": 1969
        },
        {
            "event": "Salyut 1 becomes the first space station",
            "year": 1971
        },
        {
            "event": "Dennis Tito becomes the first space tourist",
            "year": 2001
        },
        {
            "event": "Monopoly – Charles Darrow patents his version of the property trading game",
            "year": 1935
        },
        {
            "event": "Scrabble – James Brunot trademarks the name for Alfred Butts' word game",
            "year": 1948
        },
        {
            "event": "Clue – Waddington's releases 'Cluedo' in the UK",
            "year": 1949
        },
        {
            "event": "Risk – Parker Brothers releases the game of global domination",
            "year": 1959
        },
        {
            "event": "Twister – Milton Bradley releases the first game using human bodies as playing pieces",
            "year": 1966
        },
        {
            "event": "Uno – Merle Robbins invents the shedding-type card game",
            "year": 1971
        },
        {
            "event": "Catan – Klaus Teuber releases 'The Settlers of Catan' in Germany",
            "year": 1995
        },
        {
            "event": "Mark Twain, born Samuel Langhorne Clemens",
            "year": 1835
        },
        {
            "event": "Lewis Carroll, born Charles Lutwidge Dodgson",
            "year": 1832
        },
        {
            "event": "George Orwell, born Eric Arthur Blair",
            "year": 1903
        },
        {
            "event": "Dr. Seuss, born Theodor Seuss Geisel",
            "year": 1904
        },
        {
            "event": "Stan Lee, born Stanley Martin Lieber",
            "year": 1922
        },
        {
            "event": "John le Carré, born David John Moore Cornwell",
            "year": 1931
        },
        {
            "event": "Lemony Snicket, born Daniel Handler",
            "year": 1970
        },
        {
            "event": "Sony Walkman – The TPS-L2 revolutionizes portable music",
            "year": 1979
        },
        {
            "event": "IBM Personal Computer – The IBM 5150 brings computing to the masses",
            "year": 1981
        },
        {
            "event": "Nintendo Entertainment System – The NES revitalizes home video gaming in North America",
            "year": 1985
        },
        {
            "event": "Game Boy – Nintendo introduces its incredibly popular handheld console",
            "year": 1989
        },
        {
            "event": "Apple iPod – '1,000 songs in your pocket' changes the music industry",
            "year": 2001
        },
        {
            "event": "Apple iPhone – The first mobile phone to use multi-touch technology",
            "year": 2007
        },
        {
            "event": "Amazon Echo – The first smart speaker featuring the Alexa voice assistant",
            "year": 2014
        },
        {
            "event": "Miracle on 34th Street – The original film starring Maureen O'Hara and Edmund Gwenn",
            "year": 1947
        },
        {
            "event": "Rudolph the Red-Nosed Reindeer – The Rankin/Bass stop-motion television special premieres",
            "year": 1964
        },
        {
            "event": "A Charlie Brown Christmas – The Peanuts gang makes their animated TV debut",
            "year": 1965
        },
        {
            "event": "A Christmas Story – Ralphie Parker begins his quest for a Red Ryder BB gun",
            "year": 1983
        },
        {
            "event": "Home Alone – Kevin McCallister defends his house from the Wet Bandits",
            "year": 1990
        },
        {
            "event": "The Nightmare Before Christmas – Jack Skellington discovers Christmas Town",
            "year": 1993
        },
        {
            "event": "Elf – Buddy the Elf travels from the North Pole to New York City",
            "year": 2003
        },
        {
            "event": "McDonald's – Founded by Richard and Maurice McDonald in San Bernardino",
            "year": 1940
        },
        {
            "event": "In-N-Out Burger – California's first drive-thru hamburger stand opens",
            "year": 1948
        },
        {
            "event": "Burger King – Founded in Miami, originally as Insta-Burger King",
            "year": 1954
        },
        {
            "event": "Taco Bell – Glen Bell opens the first location in California",
            "year": 1962
        },
        {
            "event": "Subway – Opened originally as 'Pete\\'s Super Submarines'",
            "year": 1965
        },
        {
            "event": "Wendy's – Dave Thomas opens the first restaurant in Ohio",
            "year": 1969
        },
        {
            "event": "Starbucks – The first store opens at Seattle's Pike Place Market",
            "year": 1971
        },
        {
            "event": "Superman – Debuts in Action Comics #1",
            "year": 1938
        },
        {
            "event": "Batman – Debuts in Detective Comics #27",
            "year": 1939
        },
        {
            "event": "Wonder Woman – Debuts in All Star Comics #8",
            "year": 1941
        },
        {
            "event": "Spider-Man – Debuts in Amazing Fantasy #15",
            "year": 1962
        },
        {
            "event": "Wolverine – Debuts in a cameo in The Incredible Hulk #180",
            "year": 1974
        },
        {
            "event": "Teenage Mutant Ninja Turtles – Debuts in a self-published comic",
            "year": 1984
        },
        {
            "event": "Deadpool – Debuts in The New Mutants #98",
            "year": 1991
        },
        {
            "event": "The Teddy Bear – Created and named after President 'Teddy' Roosevelt",
            "year": 1902
        },
        {
            "event": "The Slinky – Invented by a naval engineer and hits store shelves",
            "year": 1945
        },
        {
            "event": "Mr. Potato Head – The first toy advertised on television",
            "year": 1952
        },
        {
            "event": "Barbie – Ruth Handler's iconic fashion doll debuts at the toy fair",
            "year": 1959
        },
        {
            "event": "Hot Wheels – Mattel introduces the ultimate die-cast toy cars",
            "year": 1968
        },
        {
            "event": "Rubik's Cube – Invented by Hungarian architecture professor Ernő Rubik",
            "year": 1974
        },
        {
            "event": "Furby – The robotic electronic pet becomes a massive holiday craze",
            "year": 1998
        },
        {
            "event": "SixDegrees.com – Widely considered the very first social media site",
            "year": 1997
        },
        {
            "event": "Friendster – Launched as one of the first major global social networks",
            "year": 2002
        },
        {
            "event": "Facebook – Mark Zuckerberg launches 'TheFacebook' at Harvard",
            "year": 2004
        },
        {
            "event": "YouTube – The first video, 'Me at the zoo,' is uploaded",
            "year": 2005
        },
        {
            "event": "Twitter – Jack Dorsey sends the first tweet: 'just setting up my twttr'",
            "year": 2006
        },
        {
            "event": "Instagram – The photo-sharing app launches exclusively on iOS",
            "year": 2010
        },
        {
            "event": "TikTok – Launched internationally by ByteDance",
            "year": 2016
        },
        {
            "event": "Oklahoma! – Rodgers and Hammerstein's groundbreaking first collaboration",
            "year": 1943
        },
        {
            "event": "West Side Story – Stephen Sondheim and Leonard Bernstein's tragic romance debuts",
            "year": 1957
        },
        {
            "event": "Hair – The revolutionary rock musical premieres",
            "year": 1967
        },
        {
            "event": "A Chorus Line – The definitive backstage musical opens on Broadway",
            "year": 1975
        },
        {
            "event": "The Phantom of the Opera – Andrew Lloyd Webber's masterpiece opens in the West End",
            "year": 1986
        },
        {
            "event": "Rent – Jonathan Larson's rock musical revitalizes Broadway",
            "year": 1996
        },
        {
            "event": "Hamilton – Lin-Manuel Miranda's historical hip-hop musical premieres",
            "year": 2015
        },
        {
            "event": "Snow White and the Seven Dwarfs – Disney's first full-length animated feature",
            "year": 1937
        },
        {
            "event": "Cinderella – Disney bounces back after WWII with a massive fairy tale hit",
            "year": 1950
        },
        {
            "event": "The Little Mermaid – The film that kicked off the Disney Renaissance",
            "year": 1989
        },
        {
            "event": "Toy Story – Pixar releases the first entirely computer-animated feature film",
            "year": 1995
        },
        {
            "event": "Shrek – DreamWorks turns the traditional fairy tale upside down",
            "year": 2001
        },
        {
            "event": "Finding Nemo – Pixar takes audiences on an epic underwater journey",
            "year": 2003
        },
        {
            "event": "Frozen – Elsa and Anna take the world by storm",
            "year": 2013
        },
        {
            "event": "First Network Email – Ray Tomlinson sends the first message using the '@' symbol",
            "year": 1971
        },
        {
            "event": "First Domain Registered – 'symbolics.com' becomes the first registered .com domain",
            "year": 1985
        },
        {
            "event": "World Wide Web Invented – Tim Berners-Lee writes the initial proposal at CERN",
            "year": 1989
        },
        {
            "event": "First Webcam – Created at Cambridge University just to monitor a coffee pot",
            "year": 1991
        },
        {
            "event": "First eBay Sale – Founder Pierre Omidyar sells a broken laser pointer",
            "year": 1995
        },
        {
            "event": "First Wikipedia Article – The crowdsourced encyclopedia officially launches",
            "year": 2001
        },
        {
            "event": "First Bitcoin Transaction – Satoshi Nakamoto sends 10 BTC to Hal Finney",
            "year": 2009
        },
        {
            "event": "Oreo – Nabisco introduces the 'Oreo Biscuit' to the market",
            "year": 1912
        },
        {
            "event": "Ritz Crackers – Introduced as a buttery, circular cracker during the Great Depression",
            "year": 1934
        },
        {
            "event": "Cheetos – Invented by Fritos creator Charles Elmer Doolin",
            "year": 1948
        },
        {
            "event": "Pop-Tarts – Kellogg's introduces the legendary toaster pastry",
            "year": 1964
        },
        {
            "event": "Doritos – Originally created at a restaurant in Disneyland and released nationwide",
            "year": 1966
        },
        {
            "event": "Pringles – Procter & Gamble introduces 'Pringle\\'s Newfangled Potato Chips'",
            "year": 1968
        },
        {
            "event": "Lunchables – Oscar Mayer launches the pre-packaged, build-your-own lunch",
            "year": 1988
        },
        {
            "event": "The Tale of Peter Rabbit – Beatrix Potter publishes her famous tale",
            "year": 1902
        },
        {
            "event": "Winnie-the-Pooh – A. A. Milne publishes the first collection of Pooh stories",
            "year": 1926
        },
        {
            "event": "Charlotte's Web – E. B. White publishes the classic farmyard tale",
            "year": 1952
        },
        {
            "event": "The Cat in the Hat – Dr. Seuss revolutionizes beginner reading books",
            "year": 1957
        },
        {
            "event": "Where the Wild Things Are – Maurice Sendak publishes his wildly imaginative book",
            "year": 1963
        },
        {
            "event": "The Very Hungry Caterpillar – Eric Carle introduces the hungry, hole-punching bug",
            "year": 1969
        },
        {
            "event": "Harry Potter and the Sorcerer's Stone – J.K. Rowling launches the wizarding world",
            "year": 1997
        },
        {
            "event": "Pong – Atari releases the wildly successful arcade table-tennis game",
            "year": 1972
        },
        {
            "event": "Pac-Man – Namco's yellow dot-munching mascot hits the arcades",
            "year": 1980
        },
        {
            "event": "Super Mario Bros. – Mario and Luigi save the Mushroom Kingdom on the NES",
            "year": 1985
        },
        {
            "event": "The Legend of Zelda – Link's first top-down adventure in Hyrule is released",
            "year": 1986
        },
        {
            "event": "Doom – id Software popularizes the first-person shooter genre",
            "year": 1993
        },
        {
            "event": "Final Fantasy VII – Square brings massive 3D cinematic RPGs to the PlayStation",
            "year": 1997
        },
        {
            "event": "Halo: Combat Evolved – Master Chief debuts alongside the original Xbox",
            "year": 2001
        },
        {
            "event": "Disneyland – Walt Disney opens his original park in Anaheim, California",
            "year": 1955
        },
        {
            "event": "Six Flags Over Texas – The first-ever Six Flags park opens in Arlington",
            "year": 1961
        },
        {
            "event": "Walt Disney World (Magic Kingdom) – The massive Florida resort opens its doors",
            "year": 1971
        },
        {
            "event": "Epcot – Disney's vision of a permanent World's Fair opens",
            "year": 1982
        },
        {
            "event": "Universal Studios Florida – Universal opens a theme park to rival Disney in Orlando",
            "year": 1990
        },
        {
            "event": "Disney's Animal Kingdom – Disney blends a zoo with high-tech theme park rides",
            "year": 1998
        },
        {
            "event": "The Wizarding World of Harry Potter – The immersive Hogsmeade land opens at Universal",
            "year": 2010
        },
        {
            "event": "Ford Model T – Henry Ford introduces the first affordable, mass-produced automobile",
            "year": 1908
        },
        {
            "event": "Volkswagen Beetle – Production begins on the iconic 'Bug'",
            "year": 1938
        },
        {
            "event": "Chevrolet Corvette – The quintessential American sports car is introduced",
            "year": 1953
        },
        {
            "event": "Ford Mustang – The original 'pony car' makes a wildly successful debut",
            "year": 1964
        },
        {
            "event": "Toyota Prius – The world's first mass-produced hybrid passenger car goes on sale",
            "year": 1997
        },
        {
            "event": "Tesla Model S – Tesla releases its revolutionary luxury all-electric sedan",
            "year": 2012
        },
        {
            "event": "Ford F-150 Lightning – Ford launches the all-electric version of its best-selling truck",
            "year": 2022
        },
        {
            "event": "The Microwave Oven – Percy Spencer accidentally discovers microwave cooking using radar tech",
            "year": 1945
        },
        {
            "event": "The Credit Card – Diners Club introduces the first modern multipurpose charge card",
            "year": 1950
        },
        {
            "event": "The Barcode – Norman Joseph Woodland and Bernard Silver receive the patent",
            "year": 1952
        },
        {
            "event": "The Computer Mouse – Douglas Engelbart publicly demonstrates the device for the first time",
            "year": 1968
        },
        {
            "event": "The Digital Camera – Steven Sasson at Kodak creates the first digital camera",
            "year": 1975
        },
        {
            "event": "The Compact Disc (CD) – Commercially released by Sony and Philips",
            "year": 1982
        },
        {
            "event": "The Smartphone – The IBM Simon goes on sale, featuring apps and a touchscreen",
            "year": 1994
        }
    ],
    "Geography": [
        {
            "event": "Discovery of Brazil by Cabral",
            "year": 1500
        },
        {
            "event": "Amerigo Vespucci explores South American coast",
            "year": 1501
        },
        {
            "event": "Columbus discovers Honduras",
            "year": 1502
        },
        {
            "event": "Columbus returns from fourth voyage",
            "year": 1504
        },
        {
            "event": "Waldseemüller map names America",
            "year": 1507
        },
        {
            "event": "Discovery of Moluccas by Portuguese",
            "year": 1512
        },
        {
            "event": "Balboa sees the Pacific Ocean",
            "year": 1513
        },
        {
            "event": "Havana founded",
            "year": 1515
        },
        {
            "event": "Magellan departs on global circumnavigation",
            "year": 1519
        },
        {
            "event": "Strait of Magellan discovered",
            "year": 1520
        },
        {
            "event": "Fall of Tenochtitlan",
            "year": 1521
        },
        {
            "event": "Elcano completes first circumnavigation",
            "year": 1522
        },
        {
            "event": "Verrazzano explores North American coast",
            "year": 1524
        },
        {
            "event": "Pizarro begins expedition to Peru",
            "year": 1527
        },
        {
            "event": "Pizarro captures Atahualpa",
            "year": 1532
        },
        {
            "event": "Cartier explores Gulf of St. Lawrence",
            "year": 1534
        },
        {
            "event": "Cartier names Montreal",
            "year": 1535
        },
        {
            "event": "De Soto expedition begins in North America",
            "year": 1539
        },
        {
            "event": "Coronado expedition begins in American Southwest",
            "year": 1540
        },
        {
            "event": "Discovery of the Mississippi River",
            "year": 1541
        },
        {
            "event": "Cabrillo explores California coast",
            "year": 1542
        },
        {
            "event": "Willoughby expedition attempts Northeast Passage",
            "year": 1553
        },
        {
            "event": "St. Augustine founded in Florida",
            "year": 1565
        },
        {
            "event": "Frobisher discovers Frobisher Bay",
            "year": 1576
        },
        {
            "event": "Francis Drake begins circumnavigation",
            "year": 1577
        },
        {
            "event": "Roanoke Colony founded",
            "year": 1584
        },
        {
            "event": "Davis Strait discovered",
            "year": 1585
        },
        {
            "event": "Barentsz explores Arctic",
            "year": 1595
        },
        {
            "event": "Cape Cod named by Gosnold",
            "year": 1602
        },
        {
            "event": "Port Royal founded",
            "year": 1605
        },
        {
            "event": "Discovery of Australia by Willem Janszoon",
            "year": 1606
        },
        {
            "event": "Jamestown founded",
            "year": 1607
        },
        {
            "event": "Quebec founded by Champlain",
            "year": 1608
        },
        {
            "event": "Hudson explores Hudson River",
            "year": 1609
        },
        {
            "event": "Hudson Bay discovered",
            "year": 1610
        },
        {
            "event": "Le Maire and Schouten discover Cape Horn",
            "year": 1615
        },
        {
            "event": "Baffin Bay discovered",
            "year": 1616
        },
        {
            "event": "Mayflower lands at Plymouth Rock",
            "year": 1620
        },
        {
            "event": "Nicolet reaches Lake Michigan",
            "year": 1634
        },
        {
            "event": "Abel Tasman discovers New Zealand",
            "year": 1642
        },
        {
            "event": "Tasman discovers Fiji",
            "year": 1643
        },
        {
            "event": "Tasman maps Australian coast",
            "year": 1644
        },
        {
            "event": "Cape Town founded",
            "year": 1652
        },
        {
            "event": "Marquette and Jolliet explore Mississippi River",
            "year": 1673
        },
        {
            "event": "La Salle claims Louisiana for France",
            "year": 1682
        },
        {
            "event": "Calcutta founded",
            "year": 1690
        },
        {
            "event": "Kamchatka explored by Atlasov",
            "year": 1697
        },
        {
            "event": "Dampier explores Australian coast",
            "year": 1699
        },
        {
            "event": "Roggeveen discovers Easter Island",
            "year": 1722
        },
        {
            "event": "Bering Strait discovered",
            "year": 1728
        },
        {
            "event": "Bering sights Alaska",
            "year": 1741
        },
        {
            "event": "Cook's first voyage begins",
            "year": 1768
        },
        {
            "event": "Cook explores New Zealand coastline",
            "year": 1769
        },
        {
            "event": "Cook reaches Botany Bay, Australia",
            "year": 1770
        },
        {
            "event": "Cook's second voyage begins",
            "year": 1772
        },
        {
            "event": "Cook crosses Antarctic Circle",
            "year": 1773
        },
        {
            "event": "Discovery of New Caledonia",
            "year": 1774
        },
        {
            "event": "Dominguez-Escalante expedition",
            "year": 1776
        },
        {
            "event": "Cook discovers Hawaii",
            "year": 1778
        },
        {
            "event": "First Fleet arrives in Australia",
            "year": 1788
        },
        {
            "event": "Vancouver expedition begins",
            "year": 1791
        },
        {
            "event": "Columbia River discovered by Gray",
            "year": 1792
        },
        {
            "event": "Mungo Park explores Niger River",
            "year": 1795
        },
        {
            "event": "Bass Strait discovered",
            "year": 1798
        },
        {
            "event": "Lewis and Clark expedition begins",
            "year": 1804
        },
        {
            "event": "Lewis and Clark reach the Pacific Ocean",
            "year": 1805
        },
        {
            "event": "Pike expedition begins",
            "year": 1806
        },
        {
            "event": "Antarctica sighted by Bellingshausen",
            "year": 1819
        },
        {
            "event": "Palmer sights Antarctica Peninsula",
            "year": 1820
        },
        {
            "event": "Weddell Sea discovered",
            "year": 1821
        },
        {
            "event": "Sturt explores Murray River",
            "year": 1830
        },
        {
            "event": "Ross locates North Magnetic Pole",
            "year": 1831
        },
        {
            "event": "Wilkes maps Antarctic coast",
            "year": 1840
        },
        {
            "event": "Livingstone begins Zambezi expedition",
            "year": 1852
        },
        {
            "event": "Victoria Falls discovered",
            "year": 1855
        },
        {
            "event": "Lake Victoria discovered by Speke",
            "year": 1858
        },
        {
            "event": "Burke and Wills expedition in Australia",
            "year": 1860
        },
        {
            "event": "Lake Albert discovered",
            "year": 1864
        },
        {
            "event": "Powell explores Grand Canyon",
            "year": 1869
        },
        {
            "event": "Challenger expedition begins",
            "year": 1872
        },
        {
            "event": "Nordenskiold navigates Northeast Passage",
            "year": 1878
        },
        {
            "event": "Nansen crosses Greenland",
            "year": 1888
        },
        {
            "event": "First confirmed landing on Antarctica",
            "year": 1895
        },
        {
            "event": "Gerlache expedition to Antarctica",
            "year": 1897
        },
        {
            "event": "Amundsen completes Northwest Passage",
            "year": 1906
        },
        {
            "event": "Peary claims North Pole",
            "year": 1909
        },
        {
            "event": "Amundsen reaches South Pole",
            "year": 1911
        },
        {
            "event": "Scott reaches South Pole",
            "year": 1912
        },
        {
            "event": "Endurance sinks in Antarctica",
            "year": 1915
        },
        {
            "event": "Byrd claims flight over North Pole",
            "year": 1926
        }
    ]
};

    // Seeded PRNG using mulberry32
    function mulberry32(a) {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }
    
    // Seed from string
    function getSeedFromString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
        }
        return hash;
    }
    
    function shuffleSeeded(array, randomFn) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(randomFn() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const allPuzzles = [];
    
    // Use LA Time for start date to match game logic
    const laTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const startDate = new Date(laTime);
    startDate.setHours(0,0,0,0);
    
    // Start from 2 days ago to give some padding for timezones
    startDate.setDate(startDate.getDate() - 2);
    
    const epoch = new Date("2024-01-01T00:00:00Z");
    
    let targetEndDate = new Date(startDate);
    targetEndDate.setDate(targetEndDate.getDate() + 60);
    if (requestedDate) {
        targetEndDate = new Date(requestedDate);
        targetEndDate.setHours(0,0,0,0);
        targetEndDate.setDate(targetEndDate.getDate() + 1);
    }
    
    const daysToGenerate = Math.floor((targetEndDate - epoch) / (1000 * 60 * 60 * 24));
    
    // Create a PRNG for category selection
    const catRandom = mulberry32(123456789);
    const recentCategories = [];
    const globalUsedEvents = new Set();

    for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(epoch);
        date.setDate(date.getDate() + i);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        let availableCategories = CATEGORIES.filter(c => !recentCategories.includes(c));
        if (availableCategories.length === 0) availableCategories = [...CATEGORIES];
        
        const category = availableCategories[Math.floor(catRandom() * availableCategories.length)];
        recentCategories.push(category);
        if (recentCategories.length > 6) recentCategories.shift();
        
        const seed = getSeedFromString(dateStr);
        const randomFn = mulberry32(seed);

        const categoryList = FALLBACK_DATA[category];
        const shuffledList = shuffleSeeded([...categoryList], randomFn);
        const selected = [];
        const usedYears = new Set();
        
        for (const ev of shuffledList) {
            if (!usedYears.has(ev.year) && !globalUsedEvents.has(ev.event)) {
                usedYears.add(ev.year);
                selected.push(ev);
                globalUsedEvents.add(ev.event);
                if (selected.length === 7) break;
            }
        }
        
        // Fallback in case a category doesn't have 7 unique years
        if (selected.length < 7) {
            for (const ev of shuffledList) {
                if (!selected.includes(ev)) {
                    selected.push(ev);
                    if (selected.length === 7) break;
                }
            }
        }

        allPuzzles.push({
            date: dateStr,
            category: category,
            events: selected
        });
        
        // Maintain 60-day memory bank
        if (allPuzzles.length >= 60) {
            const oldPuzzle = allPuzzles[allPuzzles.length - 60];
            oldPuzzle.events.forEach(e => globalUsedEvents.delete(e.event));
        }
    }

    let puzzles = [];
    if (requestedDate) {
        puzzles = allPuzzles.filter(p => p.date === requestedDate);
    } else {
        const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        const startIndex = allPuzzles.findIndex(p => p.date === startStr);
        if (startIndex !== -1) {
            puzzles = allPuzzles.slice(startIndex, startIndex + 60);
        }
    }

    // Special Override for World Chocolate Day (2026-07-07)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-07") {
            puzzles[i] = {
                date: "2026-07-07",
                category: "Chocolate",
                events: [
                    { event: "Hernán Cortés brings chocolate to Spain from the Americas", year: 1528 },
                    { event: "Coenraad Johannes van Houten invents the cocoa press", year: 1828 },
                    { event: "Joseph Fry creates the first modern solid chocolate bar", year: 1847 },
                    { event: "Daniel Peter and Henri Nestlé invent milk chocolate", year: 1875 },
                    { event: "Milton S. Hershey founds the Hershey Chocolate Company", year: 1894 },
                    { event: "Jean Neuhaus II invents the Belgian praline", year: 1912 },
                    { event: "Ruth Wakefield invents the chocolate chip cookie", year: 1930 }
                ]
            };
        }
    }

    // Special Override for World Wide Web Day (2026-08-01)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-08-01") {
            puzzles[i] = {
                date: "2026-08-01",
                category: "Internet History",
                events: [
                    { event: "First ARPANET message sent", year: 1969 },
                    { event: "Tim Berners-Lee invents the World Wide Web", year: 1989 },
                    { event: "Mosaic (first popular web browser) released", year: 1993 },
                    { event: "Amazon.com goes online", year: 1995 },
                    { event: "Google is founded", year: 1998 },
                    { event: "Facebook is launched", year: 2004 },
                    { event: "First video uploaded to YouTube", year: 2005 }
                ]
            };
        }
    }

    // Special Override for Model T Day (2026-10-01)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-01") {
            puzzles[i] = {
                date: "2026-10-01",
                category: "Automobile History",
                events: [
                    { event: "Karl Benz patents the Benz Patent-Motorwagen", year: 1886 },
                    { event: "Ford introduces the Model T", year: 1908 },
                    { event: "Volkswagen Beetle begins production", year: 1938 },
                    { event: "Chevrolet Corvette is introduced", year: 1953 },
                    { event: "Ford Mustang is unveiled", year: 1964 },
                    { event: "Toyota Prius (first mass-produced hybrid) is launched", year: 1997 },
                    { event: "Tesla Roadster is released", year: 2008 }
                ]
            };
        }
    }

    // Special Override for Space Exploration Day (2026-07-20)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-20") {
            puzzles[i] = {
                date: "2026-07-20",
                category: "Space Exploration",
                events: [
                    { event: "Sputnik 1 is launched", year: 1957 },
                    { event: "Yuri Gagarin becomes the first human in space", year: 1961 },
                    { event: "Apollo 11 lands on the Moon", year: 1969 },
                    { event: "Voyager 1 spacecraft is launched", year: 1977 },
                    { event: "Hubble Space Telescope is launched into orbit", year: 1990 },
                    { event: "Construction of the International Space Station begins", year: 1998 },
                    { event: "Curiosity rover lands on Mars", year: 2012 }
                ]
            };
        }
    }

    // Special Override for Global Energy Independence Day (2026-07-10)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-10") {
            puzzles[i] = {
                date: "2026-07-10",
                category: "Alternative Energy",
                events: [
                    { event: "Edmond Becquerel discovers the photovoltaic effect", year: 1839 },
                    { event: "First commercial hydroelectric power plant begins operation", year: 1882 },
                    { event: "Charles F. Brush builds the first automatically operated wind turbine", year: 1887 },
                    { event: "First geothermal power generator tested in Italy", year: 1904 },
                    { event: "Bell Labs invents the first practical silicon solar cell", year: 1954 },
                    { event: "World's first tidal power plant opens in France", year: 1966 },
                    { event: "First commercial lithium-ion battery is released", year: 1991 }
                ]
            };
        }
    }

    // Special Override for Mail Order Catalog Day (2026-08-18)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-08-18") {
            puzzles[i] = {
                date: "2026-08-18",
                category: "Catalog History",
                events: [
                    { event: "Tiffany & Co. publishes its Blue Book", year: 1845 },
                    { event: "First Montgomery Ward catalog is produced", year: 1872 },
                    { event: "First Sears watch and jewelry catalog is published", year: 1888 },
                    { event: "L.L.Bean publishes its first mail-order catalog", year: 1912 },
                    { event: "First Neiman Marcus Christmas Book is published", year: 1926 },
                    { event: "IKEA publishes its first furniture catalog in Sweden", year: 1951 },
                    { event: "J.Crew mails out its very first clothing catalog", year: 1983 }
                ]
            };
        }
    }

    // Special Override for Academy Awards (2027-03-14)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-03-14") {
            puzzles[i] = {
                date: "2027-03-14",
                category: "Academy Awards",
                events: [
                    { event: "'Casablanca' wins Best Picture", year: 1944 },
                    { event: "'The Sound of Music' wins Best Picture", year: 1966 },
                    { event: "'The Godfather' wins Best Picture", year: 1973 },
                    { event: "'Forrest Gump' wins Best Picture", year: 1995 },
                    { event: "'Titanic' wins Best Picture", year: 1998 },
                    { event: "'The Lord of the Rings: The Return of the King' wins Best Picture", year: 2004 },
                    { event: "'Oppenheimer' wins Best Picture", year: 2024 }
                ]
            };
        }
    }

    // Special Override for Grammy Awards (2027-02-07)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-02-07") {
            puzzles[i] = {
                date: "2027-02-07",
                category: "Grammy Awards",
                events: [
                    { event: "'Blood, Sweat & Tears' by Blood, Sweat & Tears wins Album of the Year", year: 1970 },
                    { event: "'52nd Street' by Billy Joel wins Album of the Year", year: 1980 },
                    { event: "'Nick of Time' by Bonnie Raitt wins Album of the Year", year: 1990 },
                    { event: "'Supernatural' by Santana wins Album of the Year", year: 2000 },
                    { event: "'We Are' by Jon Batiste wins Album of the Year", year: 2021 },
                    { event: "'Harry's House' by Harry Styles wins Album of the Year", year: 2022 },
                    { event: "'Midnights' by Taylor Swift wins Album of the Year", year: 2023 }
                ]
            };
        }
    }

    // Special Override for Grammy Awards Song of the Year (2027-02-06)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-02-06") {
            puzzles[i] = {
                date: "2027-02-06",
                category: "Grammy Awards",
                events: [
                    { event: "'Bridge over Troubled Water' by Simon & Garfunkel wins Song of the Year", year: 1971 },
                    { event: "'Every Breath You Take' by The Police wins Song of the Year", year: 1984 },
                    { event: "'Tears in Heaven' by Eric Clapton wins Song of the Year", year: 1993 },
                    { event: "'My Heart Will Go On' by Celine Dion wins Song of the Year", year: 1999 },
                    { event: "'Rolling in the Deep' by Adele wins Song of the Year", year: 2012 },
                    { event: "'Thinking Out Loud' by Ed Sheeran wins Song of the Year", year: 2016 },
                    { event: "'Bad Guy' by Billie Eilish wins Song of the Year", year: 2020 }
                ]
            };
        }
    }


    // Special Override for Nobel Prize in Medicine (2026-10-05)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-05") {
            puzzles[i] = {
                date: "2026-10-05",
                category: "Nobel Prize in Medicine",
                events: [
                    { event: "Emil von Behring wins for serum therapy.", year: 1901 },
                    { event: "Frederick Banting and John Macleod win for discovering insulin.", year: 1923 },
                    { event: "Alexander Fleming, Ernst Chain, and Howard Florey win for discovering penicillin.", year: 1945 },
                    { event: "Hans Krebs wins for discovering the citric acid cycle.", year: 1953 },
                    { event: "Watson, Crick, and Wilkins win for discovering the structure of DNA.", year: 1962 },
                    { event: "Shinya Yamanaka and John Gurdon win for reprogramming mature cells into stem cells.", year: 2012 },
                    { event: "Katalin Karikó and Drew Weissman win for developing mRNA vaccines.", year: 2023 }
                ]
            };
        }
    }

    // Special Override for Nobel Prize in Physics (2026-10-06)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-06") {
            puzzles[i] = {
                date: "2026-10-06",
                category: "Nobel Prize in Physics",
                events: [
                    { event: "Wilhelm Röntgen wins for discovering X-rays.", year: 1901 },
                    { event: "Albert Einstein wins for discovering the photoelectric effect.", year: 1921 },
                    { event: "Werner Heisenberg wins for creating quantum mechanics.", year: 1932 },
                    { event: "Enrico Fermi wins for discovering new radioactive elements.", year: 1938 },
                    { event: "Richard Feynman wins for his work in quantum electrodynamics.", year: 1965 },
                    { event: "Peter Higgs and François Englert win for discovering the Higgs mechanism.", year: 2013 },
                    { event: "Roger Penrose wins for proving that black holes are a prediction of general relativity.", year: 2020 }
                ]
            };
        }
    }

    // Special Override for Nobel Prize in Chemistry (2026-10-07)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-07") {
            puzzles[i] = {
                date: "2026-10-07",
                category: "Nobel Prize in Chemistry",
                events: [
                    { event: "Marie Curie wins for discovering radium and polonium.", year: 1911 },
                    { event: "Linus Pauling wins for his research on the chemical bond.", year: 1954 },
                    { event: "Paul Berg wins for studying the biochemistry of nucleic acids.", year: 1980 },
                    { event: "Kary Mullis wins for inventing PCR.", year: 1993 },
                    { event: "Chalfie, Shimomura, and Tsien win for discovering green fluorescent protein.", year: 2008 },
                    { event: "Goodenough, Whittingham, and Yoshino win for developing lithium-ion batteries.", year: 2019 },
                    { event: "Emmanuelle Charpentier and Jennifer Doudna win for developing CRISPR gene editing.", year: 2020 }
                ]
            };
        }
    }

    // Special Override for Nobel Prize in Literature (2026-10-08)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-08") {
            puzzles[i] = {
                date: "2026-10-08",
                category: "Nobel Prize in Literature",
                events: [
                    { event: "Rudyard Kipling wins for his original imagination and observation.", year: 1907 },
                    { event: "George Bernard Shaw wins for his idealism and humanity.", year: 1925 },
                    { event: "Ernest Hemingway wins for his narrative mastery in 'The Old Man and the Sea'.", year: 1954 },
                    { event: "Toni Morrison wins for her visionary novels of American reality.", year: 1993 },
                    { event: "Harold Pinter wins for uncovering the oppression in everyday prattle.", year: 2005 },
                    { event: "Bob Dylan wins for creating new poetic expressions within American song.", year: 2016 },
                    { event: "Annie Ernaux wins for uncovering the roots of personal memory.", year: 2022 }
                ]
            };
        }
    }

    // Special Override for Nobel Peace Prize (2026-10-09)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-09") {
            puzzles[i] = {
                date: "2026-10-09",
                category: "Nobel Peace Prize",
                events: [
                    { event: "Henry Dunant wins for founding the Red Cross.", year: 1901 },
                    { event: "Martin Luther King Jr. wins for his non-violent civil rights struggle.", year: 1964 },
                    { event: "Mother Teresa wins for bringing help to suffering humanity.", year: 1979 },
                    { event: "Mikhail Gorbachev wins for his leading role in the peace process.", year: 1990 },
                    { event: "Nelson Mandela and F.W. de Klerk win for peacefully terminating apartheid.", year: 1993 },
                    { event: "Malala Yousafzai and Kailash Satyarthi win for children's right to education.", year: 2014 },
                    { event: "Maria Ressa and Dmitry Muratov win for safeguarding freedom of expression.", year: 2021 }
                ]
            };
        }
    }

    // Special Override for Nobel Prize in Economics (2026-10-12)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-12") {
            puzzles[i] = {
                date: "2026-10-12",
                category: "Nobel Prize in Economics",
                events: [
                    { event: "Ragnar Frisch and Jan Tinbergen win for dynamic models of economic processes.", year: 1969 },
                    { event: "Milton Friedman wins for consumption analysis and monetary theory.", year: 1976 },
                    { event: "John Nash wins for analyzing equilibria in non-cooperative games.", year: 1994 },
                    { event: "Amartya Sen wins for contributions to welfare economics.", year: 1998 },
                    { event: "Paul Krugman wins for analyzing global trade patterns.", year: 2008 },
                    { event: "Banerjee, Duflo, and Kremer win for experimental approaches to alleviating poverty.", year: 2019 },
                    { event: "Claudia Goldin wins for her research on women's labor market outcomes.", year: 2023 }
                ]
            };
        }
    }

    // Special Override for Tony Award for Best Play (2027-06-12)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-06-12") {
            puzzles[i] = {
                date: "2027-06-12",
                category: "Tony Award for Best Play",
                events: [
                    { event: "'Death of a Salesman' wins Best Play.", year: 1949 },
                    { event: "'The Crucible' wins Best Play.", year: 1953 },
                    { event: "'Who's Afraid of Virginia Woolf?' wins Best Play.", year: 1963 },
                    { event: "'Amadeus' wins Best Play.", year: 1981 },
                    { event: "'Angels in America: Millennium Approaches' wins Best Play.", year: 1993 },
                    { event: "'Doubt: A Parable' wins Best Play.", year: 2005 },
                    { event: "'Harry Potter and the Cursed Child' wins Best Play.", year: 2018 }
                ]
            };
        }
    }

    // Special Override for Tony Award for Best Musical (2027-06-13)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-06-13") {
            puzzles[i] = {
                date: "2027-06-13",
                category: "Tony Award for Best Musical",
                events: [
                    { event: "'Guys and Dolls' wins Best Musical.", year: 1951 },
                    { event: "'My Fair Lady' wins Best Musical.", year: 1957 },
                    { event: "'Fiddler on the Roof' wins Best Musical.", year: 1965 },
                    { event: "'A Chorus Line' wins Best Musical.", year: 1976 },
                    { event: "'The Phantom of the Opera' wins Best Musical.", year: 1988 },
                    { event: "'The Lion King' wins Best Musical.", year: 1998 },
                    { event: "'Hamilton' wins Best Musical.", year: 2016 }
                ]
            };
        }
    }

    // Special Override for FIFA World Cup Championship (2026-07-19)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-19") {
            puzzles[i] = {
                date: "2026-07-19",
                category: "FIFA World Cup Champions",
                events: [
                    { event: "Uruguay wins the inaugural FIFA World Cup.", year: 1930 },
                    { event: "Brazil wins, launching 17-year-old Pelé to global stardom.", year: 1958 },
                    { event: "England wins their first and only World Cup on home soil.", year: 1966 },
                    { event: "Argentina wins, defined by Diego Maradona's historic performance.", year: 1986 },
                    { event: "France wins their first World Cup on home soil.", year: 1998 },
                    { event: "Spain wins their first World Cup, crowning a legendary \"golden generation\" of players.", year: 2010 },
                    { event: "Argentina wins a thrilling final, securing Lionel Messi's legacy.", year: 2022 }
                ]
            };
        }
    }


    // Special Override for NFL Super Bowl (2027-02-14)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-02-14") {
            puzzles[i] = {
                date: "2027-02-14",
                category: "NFL Super Bowl Champions",
                events: [
                    { event: "Green Bay Packers win the first ever Super Bowl.", year: 1967 },
                    { event: "Miami Dolphins win, completing the only perfect, undefeated season in NFL history.", year: 1973 },
                    { event: "Chicago Bears win, dominating with their legendary '85 defense.", year: 1986 },
                    { event: "Dallas Cowboys win, launching their 1990s dynasty.", year: 1993 },
                    { event: "New York Giants win, pulling off a massive upset to end the Patriots' perfect season.", year: 2008 },
                    { event: "New England Patriots win after completing the largest comeback in Super Bowl history (28-3).", year: 2017 },
                    { event: "Kansas City Chiefs win, cementing their modern dynasty.", year: 2024 }
                ]
            };
        }
    }

    // Special Override for NBA Finals (2027-06-03)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-06-03") {
            puzzles[i] = {
                date: "2027-06-03",
                category: "NBA Finals Champions",
                events: [
                    { event: "Boston Celtics win, capping off Bill Russell's legendary 11th championship.", year: 1969 },
                    { event: "Los Angeles Lakers win, highlighting the peak of the Magic Johnson vs. Larry Bird rivalry.", year: 1987 },
                    { event: "Chicago Bulls win, securing their first \"three-peat\" led by Michael Jordan.", year: 1993 },
                    { event: "Detroit Pistons win with a massive defensive upset over the star-studded Lakers.", year: 2004 },
                    { event: "Miami Heat win, saved in Game 6 by Ray Allen's iconic game-tying three-pointer.", year: 2013 },
                    { event: "Cleveland Cavaliers win, completing a historic 3-1 series comeback against the Warriors.", year: 2016 },
                    { event: "Golden State Warriors win, cementing the legacy of their modern dynasty.", year: 2022 }
                ]
            };
        }
    }

    // Special Override for MLB World Series (2026-10-23)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-23") {
            puzzles[i] = {
                date: "2026-10-23",
                category: "MLB World Series Champions",
                events: [
                    { event: "Boston Americans win the first modern World Series.", year: 1903 },
                    { event: "New York Yankees win, dominating with their legendary \"Murderers' Row\" lineup.", year: 1927 },
                    { event: "Brooklyn Dodgers win their first and only World Series before moving to Los Angeles.", year: 1955 },
                    { event: "New York Mets win, famously aided by the infamous Bill Buckner error in Game 6.", year: 1986 },
                    { event: "Arizona Diamondbacks win a dramatic, emotional 7-game series against the Yankees.", year: 2001 },
                    { event: "Boston Red Sox win, finally breaking the 86-year \"Curse of the Bambino.\"", year: 2004 },
                    { event: "Chicago Cubs win, ending their 108-year championship drought in a legendary Game 7.", year: 2016 }
                ]
            };
        }
    }

    // Special Override for Iconic Romantic Movies (2027-02-13)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-02-13") {
            puzzles[i] = {
                date: "2027-02-13",
                category: "Iconic Romantic Movies",
                events: [
                    { event: "'Gone with the Wind' (Classic epic romance)", year: 1939 },
                    { event: "'Casablanca' (The quintessential romantic drama)", year: 1942 },
                    { event: "'Dirty Dancing' (A massive cultural phenomenon)", year: 1987 },
                    { event: "'When Harry Met Sally...' (The gold standard for romantic comedies)", year: 1989 },
                    { event: "'Titanic' (The blockbuster epic romance)", year: 1997 },
                    { event: "'The Notebook' (The definitive modern tearjerker romance)", year: 2004 },
                    { event: "'La La Land' (A modern, critically acclaimed romantic musical)", year: 2016 }
                ]
            };
        }
    }


    // Special Override for TV Puzzles - 2026-07-17
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-17") {
            puzzles[i] = {
          "date": "2026-07-17",
          "category": "The Domestic / Family Sitcom",
          "events": [
                    {
                              "event": "Leave It to Beaver premieres, epitomizing the idealized mid-century American nuclear family.",
                              "year": 1957
                    },
                    {
                              "event": "The Brady Bunch debuts, defining the blended family sitcom for a generation.",
                              "year": 1969
                    },
                    {
                              "event": "The Cosby Show premieres, revitalizing the family sitcom format on NBC.",
                              "year": 1984
                    },
                    {
                              "event": "The Simpsons debuts as a half-hour series, satirizing the traditional family unit.",
                              "year": 1989
                    },
                    {
                              "event": "Everybody Loves Raymond premieres, mining comedy from overbearing extended family.",
                              "year": 1996
                    },
                    {
                              "event": "Malcolm in the Middle debuts, offering a chaotic, single-camera look at family life.",
                              "year": 2000
                    },
                    {
                              "event": "Black-ish premieres, exploring a family's sociopolitical and cultural identity.",
                              "year": 2014
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2026-08-25
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-08-25") {
            puzzles[i] = {
          "date": "2026-08-25",
          "category": "The Workplace Sitcom",
          "events": [
                    {
                              "event": "The Mary Tyler Moore Show debuts, focusing on the newsroom staff at WJM-TV.",
                              "year": 1970
                    },
                    {
                              "event": "Taxi premieres, following the diverse and eccentric drivers of the Sunshine Cab Company.",
                              "year": 1978
                    },
                    {
                              "event": "Cheers debuts, opening the doors to a Boston bar where everybody knows your name.",
                              "year": 1982
                    },
                    {
                              "event": "NewsRadio premieres, showcasing the brilliant ensemble cast of a fictional AM radio station.",
                              "year": 1995
                    },
                    {
                              "event": "Scrubs debuts, mixing fast-paced medical comedy with deep workplace drama at Sacred Heart Hospital.",
                              "year": 2001
                    },
                    {
                              "event": "Parks and Recreation premieres, introducing the optimistic Leslie Knope and the Pawnee Parks Department.",
                              "year": 2009
                    },
                    {
                              "event": "Superstore debuts, following the employees of the fictional big-box store Cloud 9.",
                              "year": 2015
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2026-09-18
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-09-18") {
            puzzles[i] = {
          "date": "2026-09-18",
          "category": "The 'Hangout' / Friend Group Sitcom",
          "events": [
                    {
                              "event": "Happy Days premieres, centering around Richie Cunningham, Fonzie, and their friends at Arnold's Drive-In.",
                              "year": 1974
                    },
                    {
                              "event": "The Golden Girls debuts, proving that a lively friend group sitcom works perfectly for women in their 50s and 60s.",
                              "year": 1985
                    },
                    {
                              "event": "Friends premieres on NBC, launching its six stars to global fame from the Central Perk coffee shop.",
                              "year": 1994
                    },
                    {
                              "event": "That '70s Show debuts, following a group of teenage friends hanging out in a Wisconsin basement.",
                              "year": 1998
                    },
                    {
                              "event": "How I Met Your Mother premieres, tracking a tight-knit friend group in NYC through MacLaren's Pub.",
                              "year": 2005
                    },
                    {
                              "event": "New Girl debuts, exploring the chaotic dynamic of four roommates sharing an LA loft.",
                              "year": 2011
                    },
                    {
                              "event": "Broad City premieres, chronicling the daily misadventures of two best friends in New York City.",
                              "year": 2014
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2026-10-21
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-21") {
            puzzles[i] = {
          "date": "2026-10-21",
          "category": "The Fish-Out-of-Water Sitcom",
          "events": [
                    {
                              "event": "The Beverly Hillbillies premieres, following a poor family who strikes oil and moves to a wealthy California mansion.",
                              "year": 1962
                    },
                    {
                              "event": "Green Acres debuts, featuring a wealthy New York City couple attempting to live as farmers.",
                              "year": 1965
                    },
                    {
                              "event": "Diff'rent Strokes premieres, following two boys from Harlem taken in by a wealthy Park Avenue businessman.",
                              "year": 1978
                    },
                    {
                              "event": "Perfect Strangers debuts, exploring the culture clash between a midwesterner and his distant Mediterranean cousin.",
                              "year": 1986
                    },
                    {
                              "event": "The Fresh Prince of Bel-Air premieres, starring Will Smith as a street-smart teen sent to live with wealthy relatives.",
                              "year": 1990
                    },
                    {
                              "event": "Schitt's Creek debuts, stranding a formerly filthy-rich family in a run-down rural town.",
                              "year": 2015
                    },
                    {
                              "event": "Ted Lasso premieres, following an optimistic American football coach hired to manage an English soccer team.",
                              "year": 2020
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2026-11-20
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-11-20") {
            puzzles[i] = {
          "date": "2026-11-20",
          "category": "The High-Concept / Supernatural Sitcom",
          "events": [
                    {
                              "event": "Bewitched premieres, following a powerful witch who marries an ordinary mortal man.",
                              "year": 1964
                    },
                    {
                              "event": "I Dream of Jeannie debuts, focusing on a 2,000-year-old genie and the astronaut who rescues her.",
                              "year": 1965
                    },
                    {
                              "event": "ALF premieres, following an alien from the planet Melmac who crashes into a suburban family's garage.",
                              "year": 1986
                    },
                    {
                              "event": "3rd Rock from the Sun debuts, featuring a group of extraterrestrials posing as a human family on Earth.",
                              "year": 1996
                    },
                    {
                              "event": "The Good Place premieres, twisting philosophy and the afterlife into a bright, colorful sitcom format.",
                              "year": 2016
                    },
                    {
                              "event": "Ghosts (Original UK Series) debuts, following a young couple who inherit a haunted country house.",
                              "year": 2019
                    },
                    {
                              "event": "WandaVision premieres, trapping two Marvel superheroes inside evolving eras of classic television sitcoms.",
                              "year": 2021
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2026-12-16
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-12-16") {
            puzzles[i] = {
          "date": "2026-12-16",
          "category": "The Satirical / 'No Hugging, No Learning' Sitcom",
          "events": [
                    {
                              "event": "Married... with Children premieres, providing a raunchy, cynical counter-programming option to wholesome family sitcoms.",
                              "year": 1987
                    },
                    {
                              "event": "Seinfeld debuts as The Seinfeld Chronicles, famously championing a 'no hugging, no learning' mantra.",
                              "year": 1989
                    },
                    {
                              "event": "The Larry Sanders Show premieres on HBO, offering a dark, satirical behind-the-scenes look at a late-night talk show.",
                              "year": 1992
                    },
                    {
                              "event": "Curb Your Enthusiasm debuts, turning minor social grievances into massively awkward disasters.",
                              "year": 2000
                    },
                    {
                              "event": "Arrested Development premieres, chronicling the highly selfish, out-of-touch Bluth family.",
                              "year": 2003
                    },
                    {
                              "event": "It's Always Sunny in Philadelphia debuts, pushing the boundaries of terrible behavior among a group of pub owners.",
                              "year": 2005
                    },
                    {
                              "event": "Veep premieres on HBO, providing a razor-sharp, profane satire of American politics.",
                              "year": 2012
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2027-01-18
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-01-18") {
            puzzles[i] = {
          "date": "2027-01-18",
          "category": "The Mockumentary Sitcom",
          "events": [
                    {
                              "event": "Trailer Park Boys premieres, utilizing a raw documentary style to follow the residents of Sunnyvale Trailer Park.",
                              "year": 2001
                    },
                    {
                              "event": "Reno 911! debuts, spoofing the format of the documentary reality show COPS.",
                              "year": 2003
                    },
                    {
                              "event": "The Office (US) premieres on NBC, popularizing the workplace mockumentary format for American audiences.",
                              "year": 2005
                    },
                    {
                              "event": "Modern Family debuts, utilizing the mockumentary style to capture the dynamics of a large extended family.",
                              "year": 2009
                    },
                    {
                              "event": "People Just Do Nothing premieres on the BBC, following the operators of a pirate radio station.",
                              "year": 2014
                    },
                    {
                              "event": "What We Do in the Shadows debuts, applying the mockumentary format to a house of ancient vampires in Staten Island.",
                              "year": 2019
                    },
                    {
                              "event": "Abbott Elementary premieres, following a documentary crew filming underfunded teachers in Philadelphia.",
                              "year": 2021
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2026-07-27
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-27") {
            puzzles[i] = {
          "date": "2026-07-27",
          "category": "The Procedural (Case-of-the-Week)",
          "events": [
                    {
                              "event": "Hawaii Five-O premieres, bringing high-stakes police procedural action to the tropical islands.",
                              "year": 1968
                    },
                    {
                              "event": "Columbo debuts as a regular series, popularizing the 'howcatchem' inverted detective format.",
                              "year": 1971
                    },
                    {
                              "event": "Murder, She Wrote premieres, starring Angela Lansbury as the mystery-solving author Jessica Fletcher.",
                              "year": 1984
                    },
                    {
                              "event": "Law & Order debuts, defining the modern two-part police and legal procedural format.",
                              "year": 1990
                    },
                    {
                              "event": "CSI: Crime Scene Investigation premieres, heavily influencing the depiction of forensic science in pop culture.",
                              "year": 2000
                    },
                    {
                              "event": "NCIS debuts, eventually growing into one of the most-watched procedural franchises in the world.",
                              "year": 2003
                    },
                    {
                              "event": "House M.D. premieres, applying the Sherlock Holmes detective formula to rare medical diagnoses.",
                              "year": 2004
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2026-08-08
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-08-08") {
            puzzles[i] = {
          "date": "2026-08-08",
          "category": "The Serialized / Prestige Drama",
          "events": [
                    {
                              "event": "Twin Peaks premieres, proving that network television could support deeply serialized, cinematic storytelling.",
                              "year": 1990
                    },
                    {
                              "event": "The Sopranos debuts on HBO, heavily popularizing the anti-hero protagonist in prestige drama.",
                              "year": 1999
                    },
                    {
                              "event": "The Wire premieres, offering an unparalleled, novelistic look at the institutions of Baltimore.",
                              "year": 2002
                    },
                    {
                              "event": "Mad Men debuts on AMC, utilizing the 1960s advertising world for deep character studies.",
                              "year": 2007
                    },
                    {
                              "event": "Breaking Bad premieres, tracking a mild-mannered chemistry teacher's descent into a ruthless drug kingpin.",
                              "year": 2008
                    },
                    {
                              "event": "True Detective debuts, setting the gold standard for the modern prestige anthology format.",
                              "year": 2014
                    },
                    {
                              "event": "Succession premieres, fascinating audiences with the ruthless, morally bankrupt Roy family.",
                              "year": 2018
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2026-09-01
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-09-01") {
            puzzles[i] = {
          "date": "2026-09-01",
          "category": "The Genre / Speculative Drama",
          "events": [
                    {
                              "event": "The Twilight Zone premieres, using speculative fiction to explore complex morality tales.",
                              "year": 1959
                    },
                    {
                              "event": "Star Trek (The Original Series) debuts, building an optimistic sci-fi universe that would span decades.",
                              "year": 1966
                    },
                    {
                              "event": "The X-Files premieres, making aliens, monsters, and government conspiracies watercooler conversation.",
                              "year": 1993
                    },
                    {
                              "event": "Lost debuts, hooking global audiences with its mysterious island and supernatural mythology.",
                              "year": 2004
                    },
                    {
                              "event": "Game of Thrones premieres on HBO, bringing unprecedented scale and budget to high fantasy television.",
                              "year": 2011
                    },
                    {
                              "event": "Stranger Things debuts on Netflix, creating a massive phenomenon out of sci-fi horror and 1980s nostalgia.",
                              "year": 2016
                    },
                    {
                              "event": "Severance premieres, exploring a dystopian sci-fi world where work and personal memories are surgically divided.",
                              "year": 2022
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2026-10-13
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-13") {
            puzzles[i] = {
          "date": "2026-10-13",
          "category": "The Melodrama / Soap Opera",
          "events": [
                    {
                              "event": "Dallas premieres, captivating audiences with oil tycoon wealth and the 'Who shot J.R.?' phenomenon.",
                              "year": 1978
                    },
                    {
                              "event": "Dynasty debuts, offering a wildly dramatic, campy look at wealthy rival families in Colorado.",
                              "year": 1981
                    },
                    {
                              "event": "Melrose Place premieres, turning a Los Angeles apartment complex into a hub of betrayal and manipulation.",
                              "year": 1992
                    },
                    {
                              "event": "Grey's Anatomy debuts, blending high-stakes medical cases with intense romantic melodrama.",
                              "year": 2005
                    },
                    {
                              "event": "Scandal premieres, delivering fast-paced, addictive political melodrama in Washington D.C.",
                              "year": 2012
                    },
                    {
                              "event": "This Is Us debuts, utilizing multiple timelines to deliver highly emotional, tear-jerking family drama.",
                              "year": 2016
                    },
                    {
                              "event": "Yellowstone premieres, reviving the prime-time soap opera format through the lens of a modern Western ranch.",
                              "year": 2018
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2026-11-08
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-11-08") {
            puzzles[i] = {
          "date": "2026-11-08",
          "category": "The Period / Historical Drama",
          "events": [
                    {
                              "event": "Roots premieres, a landmark historical miniseries that gripped the entire nation.",
                              "year": 1977
                    },
                    {
                              "event": "Band of Brothers debuts on HBO, offering a harrowing, cinematic look at WWII.",
                              "year": 2001
                    },
                    {
                              "event": "Rome premieres, setting a new standard for high-budget historical epics on television.",
                              "year": 2005
                    },
                    {
                              "event": "Downton Abbey debuts, exploring the rigid class structures of a post-Edwardian English country estate.",
                              "year": 2010
                    },
                    {
                              "event": "Peaky Blinders premieres, stylizing the violent post-WWI criminal underworld of Birmingham.",
                              "year": 2013
                    },
                    {
                              "event": "The Crown debuts on Netflix, chronically the decades-long reign of Queen Elizabeth II.",
                              "year": 2016
                    },
                    {
                              "event": "Chernobyl premieres, meticulously dramatizing the catastrophic 1986 nuclear disaster.",
                              "year": 2019
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2026-12-02
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-12-02") {
            puzzles[i] = {
          "date": "2026-12-02",
          "category": "The Political / Legal / Espionage Thriller",
          "events": [
                    {
                              "event": "The West Wing premieres, offering an idealized, fast-talking look at the inner workings of the White House.",
                              "year": 1999
                    },
                    {
                              "event": "24 debuts, revolutionizing the espionage thriller with its real-time ticking clock format.",
                              "year": 2001
                    },
                    {
                              "event": "Damages premieres, presenting a dark, ruthless take on high-stakes corporate litigation.",
                              "year": 2007
                    },
                    {
                              "event": "The Good Wife debuts, wrapping complex legal and political maneuvering inside a network procedural format.",
                              "year": 2009
                    },
                    {
                              "event": "Homeland premieres, delivering tense, psychological espionage involving the CIA and terrorism.",
                              "year": 2011
                    },
                    {
                              "event": "House of Cards debuts, following a deeply corrupt politician's ruthless climb to the presidency.",
                              "year": 2013
                    },
                    {
                              "event": "Billions premieres, exploring the high-stakes financial warfare between a hedge fund king and a US Attorney.",
                              "year": 2016
                    }
          ]
};
        }
    }

    // Special Override for TV Puzzles - 2027-01-09
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-01-09") {
            puzzles[i] = {
          "date": "2027-01-09",
          "category": "The Teen / Coming-of-Age Drama",
          "events": [
                    {
                              "event": "Beverly Hills, 90210 premieres, defining the modern teen drama genre for the entire decade.",
                              "year": 1990
                    },
                    {
                              "event": "My So-Called Life debuts, offering a deeply realistic and critically acclaimed look at teenage angst.",
                              "year": 1994
                    },
                    {
                              "event": "Dawson's Creek premieres, famous for its highly articulate teenagers navigating complex relationships.",
                              "year": 1998
                    },
                    {
                              "event": "The O.C. debuts, bringing indie rock and wealthy California drama to the forefront of pop culture.",
                              "year": 2003
                    },
                    {
                              "event": "Friday Night Lights premieres, offering a grounded, documentary-style look at Texas high school football.",
                              "year": 2006
                    },
                    {
                              "event": "Gossip Girl debuts, heavily influencing late 2000s teen fashion and internet culture.",
                              "year": 2007
                    },
                    {
                              "event": "Euphoria premieres on HBO, providing a visually stunning, highly explicit look at modern teenage trauma.",
                              "year": 2019
                    }
          ]
};
        }
    }

    // Special Override for Celebrity Arrests (Option 1) - 2027-06-17
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-06-17") {
            puzzles[i] = {
                date: "2027-06-17",
                category: "Notorious Pop Culture Scandals",
                events: [
                    { event: "Frank Sinatra is arrested in New Jersey on a charge of seduction and adultery.", year: 1938 },
                    { event: "Bill Gates is arrested in New Mexico for a traffic violation, resulting in a famously cheerful mugshot.", year: 1977 },
                    { event: "O.J. Simpson is arrested following the infamous, televised low-speed white Ford Bronco chase.", year: 1994 },
                    { event: "Hugh Grant is arrested in Los Angeles for lewd conduct in a public place.", year: 1995 },
                    { event: "Winona Ryder is arrested for shoplifting thousands of dollars of merchandise at Saks Fifth Avenue in Beverly Hills.", year: 2001 },
                    { event: "Lindsay Lohan is arrested for a DUI, marking the beginning of highly publicized legal troubles.", year: 2007 },
                    { event: "Justin Bieber is arrested in Miami for a DUI and illegal drag racing.", year: 2014 }
                ]
            };
        }
    }

    // Special Override: Moved July 26 puzzle to July 28 (2026-07-28)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-28") {
            puzzles[i] = {
                date: "2026-07-28",
                category: "Sports",
                events: [
                    { event: "Usain Bolt sets 100m world record", year: 2009 },
                    { event: "First Wimbledon Championship", year: 1877 },
                    { event: "First FIFA World Cup", year: 1930 },
                    { event: "Jackie Robinson breaks baseball color barrier", year: 1947 },
                    { event: "Tiger Woods wins first Masters", year: 1997 },
                    { event: "Michael Jordan's 'Flu Game'", year: 1997 },
                    { event: "Roger Bannister breaks 4-minute mile", year: 1954 }
                ]
            };
        }
    }

    // Special Override for Game Show Premieres (Option 1) - 2026-07-12
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-12") {
            puzzles[i] = {
                date: "2026-07-12",
                category: "The Golden Age of Game Show Premieres",
                events: [
                    { event: "The Price Is Right premieres on NBC with original host Bill Cullen.", year: 1956 },
                    { event: "Let's Make a Deal premieres, hosted by Monty Hall.", year: 1963 },
                    { event: "Jeopardy! makes its television debut with original host Art Fleming.", year: 1964 },
                    { event: "Wheel of Fortune premieres on daytime television, created by Merv Griffin.", year: 1975 },
                    { event: "Family Feud debuts on ABC, hosted by Richard Dawson.", year: 1976 },
                    { event: "Press Your Luck premieres, introducing audiences to the dreaded Whammy.", year: 1983 },
                    { event: "Who Wants to Be a Millionaire? debuts in the US with Regis Philbin.", year: 1999 }
                ]
            };
        }
    }

    // Special Override for Game Show Milestones (Option 2) - 2026-07-13
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-13") {
            puzzles[i] = {
                date: "2026-07-13",
                category: "Game Show Milestones & Memorable Moments",
                events: [
                    { event: "The massive quiz show scandals rock television, leading to congressional hearings.", year: 1959 },
                    { event: "Bob Barker begins his legendary 35-year run hosting the revival of The Price Is Right.", year: 1972 },
                    { event: "Vanna White joins Wheel of Fortune as the regular co-host.", year: 1982 },
                    { event: "Michael Larson famously memorizes the board pattern to win big on Press Your Luck.", year: 1984 },
                    { event: "Supermarket Sweep is revived on Lifetime, quickly becoming a daytime cult classic.", year: 1990 },
                    { event: "Ken Jennings begins his record-breaking 74-game winning streak on Jeopardy!", year: 2004 },
                    { event: "Drew Carey succeeds Bob Barker as the host of The Price Is Right.", year: 2007 }
                ]
            };
        }
    }

    // Special Override for Tech Pioneers (Option 1) - 2026-07-18
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-18") {
            puzzles[i] = {
                date: "2026-07-18",
                category: "The Trillion-Dollar Tech Pioneers",
                events: [
                    { event: "Hewlett-Packard (HP) is founded in a small Palo Alto garage.", year: 1939 },
                    { event: "Intel is founded by Gordon Moore and Robert Noyce to build semiconductor memory.", year: 1968 },
                    { event: "Microsoft is founded by Bill Gates and Paul Allen to develop software for the Altair 8800.", year: 1975 },
                    { event: "Apple is founded by Steve Jobs and Steve Wozniak to sell the Apple I personal computer.", year: 1976 },
                    { event: "Amazon is founded by Jeff Bezos in his garage as an online marketplace for books.", year: 1994 },
                    { event: "Google is founded by Larry Page and Sergey Brin while they are PhD students at Stanford.", year: 1998 },
                    { event: "Facebook (Meta) is founded by Mark Zuckerberg at Harvard University.", year: 2004 }
                ]
            };
        }
    }

    // Special Override for Web 2.0 Innovators (Option 2) - 2026-07-22
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-22") {
            puzzles[i] = {
                date: "2026-07-22",
                category: "The Infrastructure & Web 2.0 Innovators",
                events: [
                    { event: "IBM is founded originally as the Computing-Tabulating-Recording Company.", year: 1911 },
                    { event: "Intel is incorporated, kickstarting the Silicon Valley microprocessor revolution.", year: 1968 },
                    { event: "Oracle is founded by Larry Ellison to build commercial relational database systems.", year: 1977 },
                    { event: "Netflix is founded by Reed Hastings and Marc Randolph as a DVD-by-mail service.", year: 1997 },
                    { event: "YouTube is founded by three former PayPal employees.", year: 2005 },
                    { event: "Twitter is founded, introducing the concept of microblogging in 140 characters.", year: 2006 },
                    { event: "Uber is founded as a black-car service called Ubercab.", year: 2009 }
                ]
            };
        }
    }

    // Special Override for Daring Coordinated Operations (Option 2) - 2026-07-08
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-08") {
            puzzles[i] = {
                date: "2026-07-08",
                category: "Daring Coordinated Operations",
                events: [
                    { event: "The Miracle of Dunkirk successfully rescues over 338,000 Allied soldiers stranded on the beaches of France.", year: 1940 },
                    { event: "The Berlin Airlift begins, rescuing the blockaded city from starvation by constantly flying in supplies.", year: 1948 },
                    { event: "Operation Entebbe successfully rescues over 100 hostages held at an airport in Uganda.", year: 1976 },
                    { event: "The Canadian Caper successfully smuggles six American diplomats out of Iran.", year: 1979 },
                    { event: "US Air Force Captain Scott O'Grady is rescued by Marines after being shot down over Bosnia.", year: 1995 },
                    { event: "The dramatic rescue of the 33 trapped Chilean miners captivates millions on live television.", year: 2010 },
                    { event: "The Tham Luang cave rescue operation successfully extracts a boys' soccer team in Thailand.", year: 2018 }
                ]
            };
        }
    }

    // Special Override for Epic Survival (Option 1) - 2026-07-24
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-24") {
            puzzles[i] = {
                date: "2026-07-24",
                category: "Epic Survival & Media Sensations",
                events: [
                    { event: "Sir Ernest Shackleton's stranded crew is finally rescued from Elephant Island.", year: 1916 },
                    { event: "The crew of Apollo 13 is safely brought back to Earth after a critical explosion in space.", year: 1970 },
                    { event: "The 16 survivors of a plane crash in the freezing Andes mountains are rescued after 72 days.", year: 1972 },
                    { event: "Baby Jessica McClure is safely pulled from an abandoned well in Texas after a 58-hour ordeal.", year: 1987 },
                    { event: "All nine miners trapped in the flooded Quecreek Mine in Pennsylvania are successfully rescued.", year: 2002 },
                    { event: "Captain Richard Phillips is rescued from Somali pirates by US Navy SEAL snipers.", year: 2009 },
                    { event: "Four indigenous children are rescued after surviving 40 days in the Amazon rainforest following a plane crash.", year: 2023 }
                ]
            };
        }
    }

    // Special Override for Celebrity Arrests (Option 2) - 2026-07-26
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-26") {
            puzzles[i] = {
                date: "2026-07-26",
                category: "Wild & Bizarre Celebrity Run-Ins",
                events: [
                    { event: "Jim Morrison is arrested for indecent exposure and profanity during a Doors concert in Miami.", year: 1969 },
                    { event: "Paul McCartney is arrested in Tokyo after customs officials find half a pound of marijuana in his luggage.", year: 1980 },
                    { event: "Paul Reubens (Pee-wee Herman) is arrested for indecent exposure in a Florida adult movie theater.", year: 1991 },
                    { event: "O.J. Simpson is arrested following the infamous, televised low-speed white Ford Bronco chase.", year: 1994 },
                    { event: "Matthew McConaughey is arrested in Texas for marijuana possession and resisting arrest while allegedly playing bongo drums naked.", year: 1999 },
                    { event: "Nick Nolte is arrested for a DUI, resulting in arguably the most chaotic and iconic celebrity mugshot of all time.", year: 2002 },
                    { event: "Bruno Mars is arrested in Las Vegas after a bathroom attendant catches him with cocaine.", year: 2010 }
                ]
            };
        }
    }

    // Special Override for Big TV Events - 2026-07-31
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-31") {
            puzzles[i] = {
                date: "2026-07-31",
                category: "Big TV Events",
                events: [
                    { event: "The groundbreaking 'Roots' finale captivates 100 million viewers.", year: 1977 },
                    { event: "83 million viewers tune into 'Dallas' to finally learn 'Who shot J.R.?'.", year: 1980 },
                    { event: "The 'M*A*S*H' finale draws 106 million viewers, remaining the most-watched scripted episode ever.", year: 1983 },
                    { event: "Sam Malone turns off the lights for the last time in the 'Cheers' series finale.", year: 1993 },
                    { event: "A staggering 76 million viewers tune in to the polarizing series finale of 'Seinfeld'.", year: 1998 },
                    { event: "52 million viewers watch the 'Friends' cast leave their apartment keys on the counter.", year: 2004 },
                    { event: "The 'Game of Thrones' finale draws 19 million live viewers, a rare feat in the streaming era.", year: 2019 }
                ]
            };
        }
    }
    // Special Override for Pop Stars (2026-07-14)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-14") {
            puzzles[i] = {
                date: "2026-07-14",
                category: "Pop Stars",
                events: [
                    { event: "Bob Dylan – born Robert Zimmerman", year: 1941 },
                    { event: "Freddie Mercury – born Farrokh Bulsara", year: 1946 },
                    { event: "Stevie Wonder – born Stevland Hardaway Judkins", year: 1950 },
                    { event: "Shania Twain – born Eilleen Regina Edwards", year: 1965 },
                    { event: "Katy Perry – born Katheryn Elizabeth Hudson", year: 1984 },
                    { event: "Lady Gaga – born Stefani Joanne Angelina Germanotta", year: 1986 },
                    { event: "The Weeknd – born Abel Makkonen Tesfaye", year: 1990 }
                ]
            };
        }
    }

    // Special Override for Firsts in Space (2026-08-03)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-08-03") {
            puzzles[i] = {
                date: "2026-08-03",
                category: "Firsts in Space",
                events: [
                    { event: "Sputnik 1 launched – First artificial satellite", year: 1957 },
                    { event: "Yuri Gagarin orbits Earth – First human in space", year: 1961 },
                    { event: "Apollo 11 Moon landing – First humans to walk on the moon", year: 1969 },
                    { event: "Hubble Space Telescope launched – First major optical telescope in space", year: 1990 },
                    { event: "International Space Station (ISS) – First module launched", year: 1998 },
                    { event: "Curiosity rover lands on Mars – First of the modern, large-scale Mars rovers", year: 2012 },
                    { event: "James Webb Space Telescope launched – The most powerful space telescope ever built", year: 2021 }
                ]
            };
        }
    }

    // Special Override for Game Night Classics (2026-09-04)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-09-04") {
            puzzles[i] = {
                date: "2026-09-04",
                category: "Game Night Classics",
                events: [
                    { event: "Monopoly – First published by Parker Brothers", year: 1935 },
                    { event: "Scrabble – The classic crossword game", year: 1948 },
                    { event: "Risk – The game of global domination", year: 1959 },
                    { event: "Twister – The game that ties you up in knots", year: 1966 },
                    { event: "UNO – The famous color and number matching card game", year: 1971 },
                    { event: "Trivial Pursuit – The pop-culture and history trivia game", year: 1981 },
                    { event: "The Settlers of Catan – The pioneer of modern strategy board games", year: 1995 }
                ]
            };
        }
    }

    // Special Override for Pen Names (2026-10-19)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-19") {
            puzzles[i] = {
                date: "2026-10-19",
                category: "Pen Names",
                events: [
                    { event: "Lewis Carroll – born Charles Lutwidge Dodgson", year: 1832 },
                    { event: "Mark Twain – born Samuel Langhorne Clemens", year: 1835 },
                    { event: "George Orwell – born Eric Arthur Blair", year: 1903 },
                    { event: "Dr. Seuss – born Theodor Seuss Geisel", year: 1904 },
                    { event: "Stan Lee – born Stanley Martin Lieber", year: 1922 },
                    { event: "J.K. Rowling – born Joanne Rowling; also writes as Robert Galbraith", year: 1965 },
                    { event: "Lemony Snicket – born Daniel Handler", year: 1970 }
                ]
            };
        }
    }

    // Special Override for Tech Revolutions (2026-11-02)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-11-02") {
            puzzles[i] = {
                date: "2026-11-02",
                category: "Tech Revolutions",
                events: [
                    { event: "Sony Walkman – The first portable cassette player", year: 1979 },
                    { event: "Apple Macintosh – The first successful PC with a graphical user interface", year: 1984 },
                    { event: "Nintendo Game Boy – The iconic handheld gaming console", year: 1989 },
                    { event: "Sony PlayStation – The CD-ROM based console that revolutionized gaming", year: 1994 },
                    { event: "Apple iPod – '1,000 songs in your pocket'", year: 2001 },
                    { event: "Apple iPhone - The first mobile phone to use multi-touch technology", year: 2007 },
                    { event: "Amazon Echo (Alexa) – The first major smart speaker", year: 2014 }
                ]
            };
        }
    }

    // Special Override for Holiday Classics (2026-12-04)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-12-04") {
            puzzles[i] = {
                date: "2026-12-04",
                category: "Holiday Classics",
                events: [
                    { event: "It's a Wonderful Life – The classic starring Jimmy Stewart", year: 1946 },
                    { event: "Rudolph the Red-Nosed Reindeer – The stop-motion TV special", year: 1964 },
                    { event: "A Christmas Story – 'You\\'ll shoot your eye out!'", year: 1983 },
                    { event: "Home Alone – Kevin McCallister defends his house", year: 1990 },
                    { event: "The Nightmare Before Christmas – Tim Burton's Halloween/Christmas mashup", year: 1993 },
                    { event: "How the Grinch Stole Christmas! – The live-action version starring Jim Carrey", year: 2000 },
                    { event: "Elf – Starring Will Ferrell as Buddy", year: 2003 }
                ]
            };
        }
    }


    // Special Override for Fast Food Origins (2026-07-09)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-09") {
            puzzles[i] = {
          "date": "2026-07-09",
          "category": "Fast Food Origins",
          "events": [
                    {
                              "event": "McDonald's – Founded by Richard and Maurice McDonald in San Bernardino",
                              "year": 1940
                    },
                    {
                              "event": "In-N-Out Burger – California's first drive-thru hamburger stand opens",
                              "year": 1948
                    },
                    {
                              "event": "Burger King – Founded in Miami, originally as Insta-Burger King",
                              "year": 1954
                    },
                    {
                              "event": "Taco Bell – Glen Bell opens the first location in California",
                              "year": 1962
                    },
                    {
                              "event": "Subway – Opened originally as 'Pete\\'s Super Submarines'",
                              "year": 1965
                    },
                    {
                              "event": "Wendy's – Dave Thomas opens the first restaurant in Ohio",
                              "year": 1969
                    },
                    {
                              "event": "Starbucks – The first store opens at Seattle's Pike Place Market",
                              "year": 1971
                    }
          ]
};
        }
    }

    // Special Override for Comic Book Debuts (2026-07-23)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-23") {
            puzzles[i] = {
          "date": "2026-07-23",
          "category": "Comic Book Debuts",
          "events": [
                    {
                              "event": "Superman – Debuts in Action Comics #1",
                              "year": 1938
                    },
                    {
                              "event": "Batman – Debuts in Detective Comics #27",
                              "year": 1939
                    },
                    {
                              "event": "Wonder Woman – Debuts in All Star Comics #8",
                              "year": 1941
                    },
                    {
                              "event": "Spider-Man – Debuts in Amazing Fantasy #15",
                              "year": 1962
                    },
                    {
                              "event": "Wolverine – Debuts in a cameo in The Incredible Hulk #180",
                              "year": 1974
                    },
                    {
                              "event": "Teenage Mutant Ninja Turtles – Debuts in a self-published comic",
                              "year": 1984
                    },
                    {
                              "event": "Deadpool – Debuts in The New Mutants #98",
                              "year": 1991
                    }
          ]
};
        }
    }

    // Special Override for Classic Toys (2026-08-19)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-08-19") {
            puzzles[i] = {
          "date": "2026-08-19",
          "category": "Classic Toys",
          "events": [
                    {
                              "event": "The Teddy Bear – Created and named after President \"Teddy\" Roosevelt",
                              "year": 1902
                    },
                    {
                              "event": "The Slinky – Invented by a naval engineer and hits store shelves",
                              "year": 1945
                    },
                    {
                              "event": "Mr. Potato Head – The first toy advertised on television",
                              "year": 1952
                    },
                    {
                              "event": "Barbie – Ruth Handler's iconic fashion doll debuts at the toy fair",
                              "year": 1959
                    },
                    {
                              "event": "Hot Wheels – Mattel introduces the ultimate die-cast toy cars",
                              "year": 1968
                    },
                    {
                              "event": "Rubik's Cube – Invented by Hungarian architecture professor Ernő Rubik",
                              "year": 1974
                    },
                    {
                              "event": "Furby – The robotic electronic pet becomes a massive holiday craze",
                              "year": 1998
                    }
          ]
};
        }
    }

    // Special Override for Social Media Launches (2026-09-16)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-09-16") {
            puzzles[i] = {
          "date": "2026-09-16",
          "category": "Social Media Launches",
          "events": [
                    {
                              "event": "SixDegrees.com – Widely considered the very first social media site",
                              "year": 1997
                    },
                    {
                              "event": "Friendster – Launched as one of the first major global social networks",
                              "year": 2002
                    },
                    {
                              "event": "Facebook – Mark Zuckerberg launches 'TheFacebook' at Harvard",
                              "year": 2004
                    },
                    {
                              "event": "YouTube – The first video, 'Me at the zoo,' is uploaded",
                              "year": 2005
                    },
                    {
                              "event": "Twitter – Jack Dorsey sends the first tweet: 'just setting up my twttr'",
                              "year": 2006
                    },
                    {
                              "event": "Instagram – The photo-sharing app launches exclusively on iOS",
                              "year": 2010
                    },
                    {
                              "event": "TikTok – Launched internationally by ByteDance",
                              "year": 2016
                    }
          ]
};
        }
    }

    // Special Override for Broadway Smashes (2026-10-22)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-22") {
            puzzles[i] = {
          "date": "2026-10-22",
          "category": "Broadway Smashes",
          "events": [
                    {
                              "event": "Oklahoma! – Rodgers and Hammerstein's groundbreaking first collaboration",
                              "year": 1943
                    },
                    {
                              "event": "West Side Story – Stephen Sondheim and Leonard Bernstein's tragic romance debuts",
                              "year": 1957
                    },
                    {
                              "event": "Hair – The revolutionary rock musical premieres",
                              "year": 1967
                    },
                    {
                              "event": "A Chorus Line – The definitive backstage musical opens on Broadway",
                              "year": 1975
                    },
                    {
                              "event": "The Phantom of the Opera – Andrew Lloyd Webber's masterpiece opens in the West End",
                              "year": 1986
                    },
                    {
                              "event": "Rent – Jonathan Larson's rock musical revitalizes Broadway",
                              "year": 1996
                    },
                    {
                              "event": "Hamilton – Lin-Manuel Miranda's historical hip-hop musical premieres",
                              "year": 2015
                    }
          ]
};
        }
    }

    // Special Override for Animated Classics (2026-11-19)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-11-19") {
            puzzles[i] = {
          "date": "2026-11-19",
          "category": "Animated Classics",
          "events": [
                    {
                              "event": "Snow White and the Seven Dwarfs – Disney's first full-length animated feature",
                              "year": 1937
                    },
                    {
                              "event": "Cinderella – Disney bounces back after WWII with a massive fairy tale hit",
                              "year": 1950
                    },
                    {
                              "event": "The Little Mermaid – The film that kicked off the Disney Renaissance",
                              "year": 1989
                    },
                    {
                              "event": "Toy Story – Pixar releases the first entirely computer-animated feature film",
                              "year": 1995
                    },
                    {
                              "event": "Shrek – DreamWorks turns the traditional fairy tale upside down",
                              "year": 2001
                    },
                    {
                              "event": "Finding Nemo – Pixar takes audiences on an epic underwater journey",
                              "year": 2003
                    },
                    {
                              "event": "Frozen – Elsa and Anna take the world by storm",
                              "year": 2013
                    }
          ]
};
        }
    }

    // Special Override for Famous Internet Firsts (2026-07-11)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-11") {
            puzzles[i] = {
          "date": "2026-07-11",
          "category": "Famous Internet Firsts",
          "events": [
                    {
                              "event": "First Network Email – Ray Tomlinson sends the first message using the '@' symbol",
                              "year": 1971
                    },
                    {
                              "event": "First Domain Registered – 'symbolics.com' becomes the first registered .com domain",
                              "year": 1985
                    },
                    {
                              "event": "World Wide Web Invented – Tim Berners-Lee writes the initial proposal at CERN",
                              "year": 1989
                    },
                    {
                              "event": "First Webcam – Created at Cambridge University just to monitor a coffee pot",
                              "year": 1991
                    },
                    {
                              "event": "First eBay Sale – Founder Pierre Omidyar sells a broken laser pointer",
                              "year": 1995
                    },
                    {
                              "event": "First Wikipedia Article – The crowdsourced encyclopedia officially launches",
                              "year": 2001
                    },
                    {
                              "event": "First Bitcoin Transaction – Satoshi Nakamoto sends 10 BTC to Hal Finney",
                              "year": 2009
                    }
          ]
};
        }
    }

    // Special Override for Iconic Snack Foods (2026-07-21)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-07-21") {
            puzzles[i] = {
          "date": "2026-07-21",
          "category": "Iconic Snack Foods",
          "events": [
                    {
                              "event": "Oreo – Nabisco introduces the 'Oreo Biscuit' to the market",
                              "year": 1912
                    },
                    {
                              "event": "Ritz Crackers – Introduced as a buttery, circular cracker during the Great Depression",
                              "year": 1934
                    },
                    {
                              "event": "Cheetos – Invented by Fritos creator Charles Elmer Doolin",
                              "year": 1948
                    },
                    {
                              "event": "Pop-Tarts – Kellogg's introduces the legendary toaster pastry",
                              "year": 1964
                    },
                    {
                              "event": "Doritos – Originally created at a restaurant in Disneyland and released nationwide",
                              "year": 1966
                    },
                    {
                              "event": "Pringles – Procter & Gamble introduces 'Pringle\\'s Newfangled Potato Chips'",
                              "year": 1968
                    },
                    {
                              "event": "Lunchables – Oscar Mayer launches the pre-packaged, build-your-own lunch",
                              "year": 1988
                    }
          ]
};
        }
    }

    // Special Override for Classic Children's Books (2026-08-17)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-08-17") {
            puzzles[i] = {
          "date": "2026-08-17",
          "category": "Classic Children's Books",
          "events": [
                    {
                              "event": "The Tale of Peter Rabbit – Beatrix Potter publishes her famous tale",
                              "year": 1902
                    },
                    {
                              "event": "Winnie-the-Pooh – A. A. Milne publishes the first collection of Pooh stories",
                              "year": 1926
                    },
                    {
                              "event": "Charlotte's Web – E. B. White publishes the classic farmyard tale",
                              "year": 1952
                    },
                    {
                              "event": "The Cat in the Hat – Dr. Seuss revolutionizes beginner reading books",
                              "year": 1957
                    },
                    {
                              "event": "Where the Wild Things Are – Maurice Sendak publishes his wildly imaginative book",
                              "year": 1963
                    },
                    {
                              "event": "The Very Hungry Caterpillar – Eric Carle introduces the hungry, hole-punching bug",
                              "year": 1969
                    },
                    {
                              "event": "Harry Potter and the Sorcerer's Stone – J.K. Rowling launches the wizarding world",
                              "year": 1997
                    }
          ]
};
        }
    }

    // Special Override for Legendary Video Games (2026-09-29)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-09-29") {
            puzzles[i] = {
          "date": "2026-09-29",
          "category": "Legendary Video Games",
          "events": [
                    {
                              "event": "Pong – Atari releases the wildly successful arcade table-tennis game",
                              "year": 1972
                    },
                    {
                              "event": "Pac-Man – Namco's yellow dot-munching mascot hits the arcades",
                              "year": 1980
                    },
                    {
                              "event": "Super Mario Bros. – Mario and Luigi save the Mushroom Kingdom on the NES",
                              "year": 1985
                    },
                    {
                              "event": "The Legend of Zelda – Link's first top-down adventure in Hyrule is released",
                              "year": 1986
                    },
                    {
                              "event": "Doom – id Software popularizes the first-person shooter genre",
                              "year": 1993
                    },
                    {
                              "event": "Final Fantasy VII – Square brings massive 3D cinematic RPGs to the PlayStation",
                              "year": 1997
                    },
                    {
                              "event": "Halo: Combat Evolved – Master Chief debuts alongside the original Xbox",
                              "year": 2001
                    }
          ]
};
        }
    }

    // Special Override for Famous Theme Parks (2026-10-26)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-26") {
            puzzles[i] = {
          "date": "2026-10-26",
          "category": "Famous Theme Parks",
          "events": [
                    {
                              "event": "Disneyland – Walt Disney opens his original park in Anaheim, California",
                              "year": 1955
                    },
                    {
                              "event": "Six Flags Over Texas – The first-ever Six Flags park opens in Arlington",
                              "year": 1961
                    },
                    {
                              "event": "Walt Disney World (Magic Kingdom) – The massive Florida resort opens its doors",
                              "year": 1971
                    },
                    {
                              "event": "Epcot – Disney's vision of a permanent World's Fair opens",
                              "year": 1982
                    },
                    {
                              "event": "Universal Studios Florida – Universal opens a theme park to rival Disney in Orlando",
                              "year": 1990
                    },
                    {
                              "event": "Disney's Animal Kingdom – Disney blends a zoo with high-tech theme park rides",
                              "year": 1998
                    },
                    {
                              "event": "The Wizarding World of Harry Potter – The immersive Hogsmeade land opens at Universal",
                              "year": 2010
                    }
          ]
};
        }
    }

    // Special Override for Iconic Cars (2026-11-06)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-11-06") {
            puzzles[i] = {
          "date": "2026-11-06",
          "category": "Iconic Cars",
          "events": [
                    {
                              "event": "Ford Model T – Henry Ford introduces the first affordable, mass-produced automobile",
                              "year": 1908
                    },
                    {
                              "event": "Volkswagen Beetle – Production begins on the iconic 'Bug'",
                              "year": 1938
                    },
                    {
                              "event": "Chevrolet Corvette – The quintessential American sports car is introduced",
                              "year": 1953
                    },
                    {
                              "event": "Ford Mustang – The original 'pony car' makes a wildly successful debut",
                              "year": 1964
                    },
                    {
                              "event": "Toyota Prius – The world's first mass-produced hybrid passenger car goes on sale",
                              "year": 1997
                    },
                    {
                              "event": "Tesla Model S – Tesla releases its revolutionary luxury all-electric sedan",
                              "year": 2012
                    },
                    {
                              "event": "Ford F-150 Lightning – Ford launches the all-electric version of its best-selling truck",
                              "year": 2022
                    }
          ]
};
        }
    }

    // Special Override for Modern Everyday Inventions (2026-12-13)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-12-13") {
            puzzles[i] = {
          "date": "2026-12-13",
          "category": "Modern Everyday Inventions",
          "events": [
                    {
                              "event": "The Microwave Oven – Percy Spencer accidentally discovers microwave cooking using radar tech",
                              "year": 1945
                    },
                    {
                              "event": "The Credit Card – Diners Club introduces the first modern multipurpose charge card",
                              "year": 1950
                    },
                    {
                              "event": "The Barcode – Norman Joseph Woodland and Bernard Silver receive the patent",
                              "year": 1952
                    },
                    {
                              "event": "The Computer Mouse – Douglas Engelbart publicly demonstrates the device for the first time",
                              "year": 1968
                    },
                    {
                              "event": "The Digital Camera – Steven Sasson at Kodak creates the first digital camera",
                              "year": 1975
                    },
                    {
                              "event": "The Compact Disc (CD) – Commercially released by Sony and Philips",
                              "year": 1982
                    },
                    {
                              "event": "The Smartphone – The IBM Simon goes on sale, featuring apps and a touchscreen",
                              "year": 1994
                    }
          ]
};
        }
    }
    // Shuffle events for each puzzle to ensure they are mixed up when presented
    for (let p of puzzles) {
        const seed = getSeedFromString(p.date + "-shuffle");
        const randomFn = mulberry32(seed);
        p.events = shuffleSeeded(p.events, randomFn);
    }

    return new Response(JSON.stringify(puzzles), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
}
