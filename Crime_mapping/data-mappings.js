// ===========================
// Data Mappings and Constants
// ===========================

// Map center and zoom for Sweden overview
const SWEDEN_CENTER = [62.0, 15.0];
const SWEDEN_ZOOM = 5;

// Crime type color mappings
const CRIME_TYPE_COLORS = {
    'Mord/dråp': '#8B0000',
    'Mord/dråp, försök': '#DC143C',
    'Misshandel': '#FF6347',
    'Misshandel, grov': '#FF4500',
    'Våldtäkt': '#8B008B',
    'Rån': '#FF8C00',
    'Stöld': '#DAA520',
    'Stöld/inbrott': '#B8860B',
    'Brand': '#FF0000',
    'Trafikolycka': '#4169E1',
    'Rattfylleri': '#9370DB',
    'Narkotikabrott': '#32CD32',
    'Skadegörelse': '#A0522D',
    'default': '#3498db'
};

// Swedish regions (län) coordinates for map zoom
const REGION_COORDINATES = {
    'Stockholms län': { center: [59.33, 18.07], zoom: 9 },
    'Uppsala län': { center: [59.86, 17.64], zoom: 9 },
    'Södermanlands län': { center: [59.18, 16.55], zoom: 9 },
    'Östergötlands län': { center: [58.41, 15.62], zoom: 8 },
    'Jönköpings län': { center: [57.78, 14.16], zoom: 8 },
    'Kronobergs län': { center: [56.88, 14.81], zoom: 9 },
    'Kalmar län': { center: [56.66, 16.36], zoom: 8 },
    'Gotlands län': { center: [57.63, 18.30], zoom: 9 },
    'Blekinge län': { center: [56.16, 15.59], zoom: 9 },
    'Skåne län': { center: [55.99, 13.59], zoom: 8 },
    'Hallands län': { center: [56.89, 12.82], zoom: 9 },
    'Västra Götalands län': { center: [58.00, 13.00], zoom: 7 },
    'Värmlands län': { center: [59.70, 13.20], zoom: 8 },
    'Örebro län': { center: [59.27, 15.21], zoom: 9 },
    'Västmanlands län': { center: [59.62, 16.55], zoom: 9 },
    'Dalarnas län': { center: [61.00, 14.55], zoom: 7 },
    'Gävleborgs län': { center: [61.30, 16.15], zoom: 8 },
    'Västernorrlands län': { center: [63.18, 17.13], zoom: 8 },
    'Jämtlands län': { center: [63.18, 14.64], zoom: 7 },
    'Västerbottens län': { center: [64.75, 18.05], zoom: 7 },
    'Norrbottens län': { center: [66.50, 20.50], zoom: 6 }
};

// Complete mapping of Swedish regions (län) to municipalities (kommuner)
// Source: Wikipedia - List of municipalities of Sweden (290 municipalities, 21 counties)
const REGION_MUNICIPALITY_MAPPING = {
    'Stockholms län': [
        'Botkyrka', 'Danderyd', 'Ekerö', 'Haninge', 'Huddinge', 'Järfälla', 
        'Lidingö', 'Nacka', 'Norrtälje', 'Nykvarn', 'Nynäshamn', 'Salem', 
        'Sigtuna', 'Sollentuna', 'Solna', 'Stockholm', 'Sundbyberg', 'Södertälje', 
        'Tyresö', 'Täby', 'Upplands Väsby', 'Upplands-Bro', 'Vallentuna', 
        'Vaxholm', 'Värmdö', 'Österåker'
    ],
    'Uppsala län': [
        'Enköping', 'Heby', 'Håbo', 'Knivsta', 'Tierp', 'Uppsala', 'Älvkarleby', 
        'Östhammar'
    ],
    'Södermanlands län': [
        'Eskilstuna', 'Flen', 'Gnesta', 'Katrineholm', 'Nyköping', 'Oxelösund', 
        'Strängnäs', 'Trosa', 'Vingåker'
    ],
    'Östergötlands län': [
        'Boxholm', 'Finspång', 'Kinda', 'Linköping', 'Mjölby', 'Motala', 
        'Norrköping', 'Söderköping', 'Vadstena', 'Valdemarsvik', 'Ydre', 
        'Åtvidaberg', 'Ödeshög'
    ],
    'Jönköpings län': [
        'Aneby', 'Eksjö', 'Gislaved', 'Gnosjö', 'Habo', 'Jönköping', 
        'Mullsjö', 'Nässjö', 'Sävsjö', 'Tranås', 'Vaggeryd', 'Vetlanda', 
        'Värnamo'
    ],
    'Kronobergs län': [
        'Alvesta', 'Lessebo', 'Ljungby', 'Markaryd', 'Tingsryd', 'Uppvidinge', 
        'Växjö', 'Älmhult'
    ],
    'Kalmar län': [
        'Borgholm', 'Emmaboda', 'Hultsfred', 'Högsby', 'Kalmar', 'Mönsterås', 
        'Mörbylånga', 'Nybro', 'Oskarshamn', 'Torsås', 'Vimmerby', 'Västervik'
    ],
    'Gotlands län': [
        'Gotland'
    ],
    'Blekinge län': [
        'Karlshamn', 'Karlskrona', 'Olofström', 'Ronneby', 'Sölvesborg'
    ],
    'Skåne län': [
        'Bjuv', 'Bromölla', 'Burlöv', 'Båstad', 'Eslöv', 'Helsingborg', 
        'Hässleholm', 'Höganäs', 'Hörby', 'Höör', 'Klippan', 'Kristianstad', 
        'Kävlinge', 'Landskrona', 'Lomma', 'Lund', 'Malmö', 'Osby', 
        'Perstorp', 'Simrishamn', 'Sjöbo', 'Skurup', 'Staffanstorp', 
        'Svalöv', 'Svedala', 'Tomelilla', 'Trelleborg', 'Vellinge', 
        'Ystad', 'Åstorp', 'Ängelholm', 'Örkelljunga', 'Östra Göinge'
    ],
    'Hallands län': [
        'Falkenberg', 'Halmstad', 'Hylte', 'Kungsbacka', 'Laholm', 'Varberg'
    ],
    'Västra Götalands län': [
        'Ale', 'Alingsås', 'Bengtsfors', 'Bollebygd', 'Borås', 'Dals-Ed', 
        'Essunga', 'Falköping', 'Färgelanda', 'Grästorp', 'Gullspång', 
        'Göteborg', 'Götene', 'Herrljunga', 'Hjo', 'Härryda', 'Karlsborg', 
        'Kungälv', 'Lerum', 'Lidköping', 'Lilla Edet', 'Lysekil', 'Mariestad', 
        'Mark', 'Mellerud', 'Munkedal', 'Mölndal', 'Orust', 'Partille', 
        'Skara', 'Skövde', 'Sotenäs', 'Stenungsund', 'Strömstad', 'Svenljunga', 
        'Tanum', 'Tibro', 'Tidaholm', 'Tjörn', 'Tranemo', 'Trollhättan', 
        'Töreboda', 'Uddevalla', 'Ulricehamn', 'Vara', 'Vårgårda', 
        'Vänersborg', 'Åmål', 'Öckerö'
    ],
    'Värmlands län': [
        'Arvika', 'Eda', 'Filipstad', 'Forshaga', 'Grums', 'Hagfors', 
        'Hammarö', 'Karlstad', 'Kil', 'Kristinehamn', 'Munkfors', 'Storfors', 
        'Sunne', 'Säffle', 'Torsby', 'Årjäng'
    ],
    'Örebro län': [
        'Askersund', 'Degerfors', 'Hallsberg', 'Hällefors', 'Karlskoga', 
        'Kumla', 'Laxå', 'Lekeberg', 'Lindesberg', 'Ljusnarsberg', 'Nora', 
        'Örebro'
    ],
    'Västmanlands län': [
        'Arboga', 'Fagersta', 'Hallstahammar', 'Kungsör', 'Köping', 'Norberg', 
        'Sala', 'Skinnskatteberg', 'Surahammar', 'Västerås'
    ],
    'Dalarnas län': [
        'Avesta', 'Borlänge', 'Falun', 'Gagnef', 'Hedemora', 'Leksand', 
        'Ludvika', 'Malung-Sälen', 'Mora', 'Orsa', 'Rättvik', 'Smedjebacken', 
        'Säter', 'Vansbro', 'Älvdalen'
    ],
    'Gävleborgs län': [
        'Bollnäs', 'Gävle', 'Hofors', 'Hudiksvall', 'Ljusdal', 'Nordanstig', 
        'Ockelbo', 'Ovanåker', 'Sandviken', 'Söderhamn'
    ],
    'Västernorrlands län': [
        'Härnösand', 'Kramfors', 'Sollefteå', 'Sundsvall', 'Timrå', 
        'Ånge', 'Örnsköldsvik'
    ],
    'Jämtlands län': [
        'Berg', 'Bräcke', 'Härjedalen', 'Krokom', 'Ragunda', 'Strömsund', 
        'Åre', 'Östersund'
    ],
    'Västerbottens län': [
        'Bjurholm', 'Dorotea', 'Lycksele', 'Malå', 'Nordmaling', 'Norsjö', 
        'Robertsfors', 'Skellefteå', 'Sorsele', 'Storuman', 'Umeå', 
        'Vilhelmina', 'Vindeln', 'Vännäs', 'Åsele'
    ],
    'Norrbottens län': [
        'Arjeplog', 'Arvidsjaur', 'Boden', 'Gällivare', 'Haparanda', 
        'Jokkmokk', 'Kalix', 'Kiruna', 'Luleå', 'Pajala', 'Piteå', 
        'Älvsbyn', 'Överkalix', 'Övertorneå'
    ]
};
