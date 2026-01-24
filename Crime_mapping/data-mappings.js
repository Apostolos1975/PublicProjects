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

// Region capitals (administrative or largest city)
const REGION_CAPITALS = {
    'Stockholms län': 'Stockholm',
    'Uppsala län': 'Uppsala',
    'Södermanlands län': 'Nyköping',
    'Östergötlands län': 'Linköping',
    'Jönköpings län': 'Jönköping',
    'Kronobergs län': 'Växjö',
    'Kalmar län': 'Kalmar',
    'Gotlands län': 'Gotland',
    'Blekinge län': 'Karlskrona',
    'Skåne län': 'Malmö',
    'Hallands län': 'Halmstad',
    'Västra Götalands län': 'Göteborg',
    'Värmlands län': 'Karlstad',
    'Örebro län': 'Örebro',
    'Västmanlands län': 'Västerås',
    'Dalarnas län': 'Falun',
    'Gävleborgs län': 'Gävle',
    'Västernorrlands län': 'Härnösand',
    'Jämtlands län': 'Östersund',
    'Västerbottens län': 'Umeå',
    'Norrbottens län': 'Luleå'
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

// Municipality center coordinates (administrative centers/tätorter)
// Source: OpenStreetMap and Statistics Sweden (SCB)
// Format: [latitude, longitude]
const MUNICIPALITY_COORDINATES = {
    // Stockholms län (26)
    'Botkyrka': [59.2028, 17.8333],
    'Danderyd': [59.3958, 18.0333],
    'Ekerö': [59.2833, 17.8000],
    'Haninge': [59.1686, 18.1444],
    'Huddinge': [59.2372, 17.9803],
    'Järfälla': [59.4186, 17.8547],
    'Lidingö': [59.3667, 18.1333],
    'Nacka': [59.3097, 18.1636],
    'Norrtälje': [59.7578, 18.7050],
    'Nykvarn': [59.1764, 17.4186],
    'Nynäshamn': [58.9031, 17.9486],
    'Salem': [59.1833, 17.7667],
    'Sigtuna': [59.6144, 17.7244],
    'Sollentuna': [59.4281, 17.9508],
    'Solna': [59.3603, 18.0000],
    'Stockholm': [59.3293, 18.0686],
    'Sundbyberg': [59.3608, 17.9714],
    'Södertälje': [59.1953, 17.6253],
    'Tyresö': [59.2436, 18.2428],
    'Täby': [59.4439, 18.0686],
    'Upplands Väsby': [59.5178, 17.9119],
    'Upplands-Bro': [59.5167, 17.6167],
    'Vallentuna': [59.5342, 18.0778],
    'Vaxholm': [59.4022, 18.3528],
    'Värmdö': [59.2883, 18.3564],
    'Österåker': [59.4828, 18.3083],
    
    // Uppsala län (8)
    'Enköping': [59.6356, 17.0775],
    'Heby': [59.9119, 17.1408],
    'Håbo': [59.6000, 17.5333],
    'Knivsta': [59.7236, 17.7978],
    'Tierp': [60.3453, 17.5203],
    'Uppsala': [59.8586, 17.6389],
    'Älvkarleby': [60.5678, 17.4547],
    'Östhammar': [60.2594, 18.3736],
    
    // Södermanlands län (9)
    'Eskilstuna': [59.3667, 16.5097],
    'Flen': [59.0600, 16.5872],
    'Gnesta': [59.0475, 17.3092],
    'Katrineholm': [59.0000, 16.2000],
    'Nyköping': [58.7531, 17.0086],
    'Oxelösund': [58.6692, 17.1028],
    'Strängnäs': [59.3778, 17.0336],
    'Trosa': [58.8956, 17.5553],
    'Vingåker': [59.0442, 15.8728],
    
    // Östergötlands län (13)
    'Boxholm': [58.1956, 15.0531],
    'Finspång': [58.7058, 15.7708],
    'Kinda': [57.9833, 15.5500],
    'Linköping': [58.4108, 15.6214],
    'Mjölby': [58.3253, 15.1297],
    'Motala': [58.5372, 15.0386],
    'Norrköping': [58.5942, 16.1826],
    'Söderköping': [58.4833, 16.3333],
    'Vadstena': [58.4511, 14.8897],
    'Valdemarsvik': [58.2011, 16.6108],
    'Ydre': [57.8500, 15.3000],
    'Åtvidaberg': [58.2019, 16.0003],
    'Ödeshög': [58.2333, 14.6500],
    
    // Jönköpings län (13)
    'Aneby': [57.8356, 14.8100],
    'Eksjö': [57.6667, 14.9667],
    'Gislaved': [57.3044, 13.5383],
    'Gnosjö': [57.3578, 13.7386],
    'Habo': [57.9089, 14.0736],
    'Jönköping': [57.7826, 14.1618],
    'Mullsjö': [57.9139, 13.8825],
    'Nässjö': [57.6531, 14.6969],
    'Sävsjö': [57.4031, 14.6628],
    'Tranås': [58.0372, 14.9786],
    'Vaggeryd': [57.4961, 13.9439],
    'Vetlanda': [57.4289, 15.0728],
    'Värnamo': [57.1861, 14.0400],
    
    // Kronobergs län (8)
    'Alvesta': [56.8989, 14.5561],
    'Lessebo': [56.7542, 15.2686],
    'Ljungby': [56.8328, 13.9406],
    'Markaryd': [56.4667, 13.5986],
    'Tingsryd': [56.5253, 14.9808],
    'Uppvidinge': [56.8833, 15.4333],
    'Växjö': [56.8789, 14.8097],
    'Älmhult': [56.5525, 14.1375],
    
    // Kalmar län (12)
    'Borgholm': [56.8792, 16.6528],
    'Emmaboda': [56.6278, 15.5408],
    'Hultsfred': [57.4886, 15.8397],
    'Högsby': [57.1667, 16.0333],
    'Kalmar': [56.6634, 16.3561],
    'Mönsterås': [57.0422, 16.4386],
    'Mörbylånga': [56.5194, 16.3847],
    'Nybro': [56.7428, 15.9086],
    'Oskarshamn': [57.2644, 16.4486],
    'Torsås': [56.4239, 16.0122],
    'Vimmerby': [57.6658, 15.8558],
    'Västervik': [57.7583, 16.6372],
    
    // Gotlands län (1)
    'Gotland': [57.6348, 18.2948],
    
    // Blekinge län (5)
    'Karlshamn': [56.1706, 14.8617],
    'Karlskrona': [56.1612, 15.5869],
    'Olofström': [56.2806, 14.5394],
    'Ronneby': [56.2097, 15.2764],
    'Sölvesborg': [56.0511, 14.5892],
    
    // Skåne län (33)
    'Bjuv': [56.0833, 12.9167],
    'Bromölla': [56.0697, 14.4694],
    'Burlöv': [55.6453, 13.0831],
    'Båstad': [56.4294, 12.8475],
    'Eslöv': [55.8394, 13.3044],
    'Helsingborg': [56.0465, 12.6945],
    'Hässleholm': [56.1589, 13.7664],
    'Höganäs': [56.1989, 12.5564],
    'Hörby': [55.8517, 13.6578],
    'Höör': [55.9372, 13.5419],
    'Klippan': [56.1292, 13.1275],
    'Kristianstad': [56.0294, 14.1567],
    'Kävlinge': [55.7917, 13.1097],
    'Landskrona': [55.8708, 12.8303],
    'Lomma': [55.6739, 13.0847],
    'Lund': [55.7047, 13.1910],
    'Malmö': [55.6050, 13.0038],
    'Osby': [56.3800, 13.9936],
    'Perstorp': [56.1383, 13.3986],
    'Simrishamn': [55.5561, 14.3522],
    'Sjöbo': [55.6292, 13.7056],
    'Skurup': [55.4783, 13.4958],
    'Staffanstorp': [55.6444, 13.2075],
    'Svalöv': [55.9106, 13.1089],
    'Svedala': [55.5081, 13.2383],
    'Tomelilla': [55.5450, 13.9708],
    'Trelleborg': [55.3753, 13.1569],
    'Vellinge': [55.4700, 13.0142],
    'Ystad': [55.4297, 13.8203],
    'Åstorp': [56.1344, 12.9450],
    'Ängelholm': [56.2428, 12.8644],
    'Örkelljunga': [56.2839, 13.2794],
    'Östra Göinge': [56.2667, 14.0833],
    
    // Hallands län (6)
    'Falkenberg': [56.9050, 12.4911],
    'Halmstad': [56.6745, 12.8572],
    'Hylte': [56.9900, 13.2483],
    'Kungsbacka': [57.4872, 12.0764],
    'Laholm': [56.5119, 13.0431],
    'Varberg': [57.1056, 12.2503],
    
    // Västra Götalands län (49)
    'Ale': [57.9333, 12.0833],
    'Alingsås': [57.9306, 12.5336],
    'Bengtsfors': [58.9906, 12.2303],
    'Bollebygd': [57.6667, 12.5667],
    'Borås': [57.7211, 12.9394],
    'Dals-Ed': [59.0522, 11.9381],
    'Essunga': [58.1833, 12.7167],
    'Falköping': [58.1739, 13.5506],
    'Färgelanda': [58.5686, 12.2042],
    'Grästorp': [58.3378, 12.6011],
    'Gullspång': [58.9856, 14.1053],
    'Göteborg': [57.7089, 11.9746],
    'Götene': [58.5419, 13.4281],
    'Herrljunga': [58.0828, 13.0261],
    'Hjo': [58.3022, 14.2828],
    'Härryda': [57.6586, 12.3233],
    'Karlsborg': [58.5331, 14.5111],
    'Kungälv': [57.8706, 11.9800],
    'Lerum': [57.7706, 12.2689],
    'Lidköping': [58.5050, 13.1578],
    'Lilla Edet': [58.1333, 12.1333],
    'Lysekil': [58.2739, 11.4353],
    'Mariestad': [58.7097, 13.8236],
    'Mark': [57.5000, 12.7833],
    'Mellerud': [58.6986, 12.4586],
    'Munkedal': [58.4644, 11.6783],
    'Mölndal': [57.6547, 12.0136],
    'Orust': [58.2333, 11.6333],
    'Partille': [57.7397, 12.1061],
    'Skara': [58.3858, 13.4383],
    'Skövde': [58.3908, 13.8453],
    'Sotenäs': [58.4833, 11.2500],
    'Stenungsund': [58.0703, 11.8181],
    'Strömstad': [58.9378, 11.1742],
    'Svenljunga': [57.4972, 13.1097],
    'Tanum': [58.7261, 11.3308],
    'Tibro': [58.4236, 14.1608],
    'Tidaholm': [58.1806, 13.9581],
    'Tjörn': [58.0000, 11.6667],
    'Tranemo': [57.4886, 13.3503],
    'Trollhättan': [58.2836, 12.2886],
    'Töreboda': [58.7058, 14.1247],
    'Uddevalla': [58.3478, 11.9381],
    'Ulricehamn': [57.7922, 13.4136],
    'Vara': [58.2606, 12.9556],
    'Vårgårda': [57.9667, 12.8167],
    'Vänersborg': [58.3806, 12.3236],
    'Åmål': [59.0506, 12.7044],
    'Öckerö': [57.7167, 11.6500],
    
    // Värmlands län (16)
    'Arvika': [59.6556, 12.5900],
    'Eda': [59.8667, 12.4000],
    'Filipstad': [59.7089, 14.1681],
    'Forshaga': [59.5331, 13.4792],
    'Grums': [59.3586, 13.1106],
    'Hagfors': [60.0278, 13.6497],
    'Hammarö': [59.3500, 13.6167],
    'Karlstad': [59.3793, 13.5036],
    'Kil': [59.5000, 13.3167],
    'Kristinehamn': [59.3097, 14.1081],
    'Munkfors': [59.8411, 13.5483],
    'Storfors': [59.6000, 14.2167],
    'Sunne': [59.8436, 13.1200],
    'Säffle': [59.1331, 12.9328],
    'Torsby': [60.1306, 12.9967],
    'Årjäng': [59.3828, 12.1381],
    
    // Örebro län (12)
    'Askersund': [58.8786, 14.9039],
    'Degerfors': [59.2583, 14.4361],
    'Hallsberg': [59.0664, 15.1100],
    'Hällefors': [59.7783, 14.5194],
    'Karlskoga': [59.3267, 14.5236],
    'Kumla': [59.1261, 15.1411],
    'Laxå': [58.9833, 14.6167],
    'Lekeberg': [59.0667, 15.2500],
    'Lindesberg': [59.5936, 15.2350],
    'Ljusnarsberg': [59.8833, 14.7833],
    'Nora': [59.5169, 15.0333],
    'Örebro': [59.2753, 15.2134],
    
    // Västmanlands län (10)
    'Arboga': [59.3933, 15.8378],
    'Fagersta': [60.0050, 15.7906],
    'Hallstahammar': [59.6167, 16.2333],
    'Kungsör': [59.4258, 15.8236],
    'Köping': [59.5139, 15.9925],
    'Norberg': [60.0572, 15.9186],
    'Sala': [59.9239, 16.6061],
    'Skinnskatteberg': [59.8333, 15.7500],
    'Surahammar': [59.7378, 16.2408],
    'Västerås': [59.6099, 16.5448],
    
    // Dalarnas län (15)
    'Avesta': [60.1458, 16.1697],
    'Borlänge': [60.4858, 15.4378],
    'Falun': [60.6078, 15.6264],
    'Gagnef': [60.5792, 15.0831],
    'Hedemora': [60.2764, 15.9925],
    'Leksand': [60.7306, 15.0000],
    'Ludvika': [60.1494, 15.1881],
    'Malung-Sälen': [60.6806, 13.7111],
    'Mora': [61.0078, 14.5408],
    'Orsa': [61.1194, 14.6200],
    'Rättvik': [60.8847, 15.1150],
    'Smedjebacken': [60.1428, 15.4081],
    'Säter': [60.3472, 15.7536],
    'Vansbro': [60.5333, 13.8667],
    'Älvdalen': [61.2286, 13.5511],
    
    // Gävleborgs län (10)
    'Bollnäs': [61.3486, 16.3950],
    'Gävle': [60.6749, 17.1414],
    'Hofors': [60.5478, 16.2789],
    'Hudiksvall': [61.7278, 17.1050],
    'Ljusdal': [61.8272, 16.0900],
    'Nordanstig': [61.8833, 17.1667],
    'Ockelbo': [60.8833, 16.7167],
    'Ovanåker': [61.2333, 16.4333],
    'Sandviken': [60.6167, 16.7719],
    'Söderhamn': [61.3036, 17.0661],
    
    // Västernorrlands län (7)
    'Härnösand': [62.6322, 17.9378],
    'Kramfors': [62.9333, 17.7833],
    'Sollefteå': [63.1686, 17.2686],
    'Sundsvall': [62.3908, 17.3069],
    'Timrå': [62.4847, 17.3289],
    'Ånge': [62.5278, 15.6608],
    'Örnsköldsvik': [63.2909, 18.7153],
    
    // Jämtlands län (8)
    'Berg': [62.7167, 13.0000],
    'Bräcke': [62.7500, 15.4167],
    'Härjedalen': [62.0833, 13.6500],
    'Krokom': [63.3167, 14.4667],
    'Ragunda': [63.0833, 16.4667],
    'Strömsund': [63.8472, 15.5547],
    'Åre': [63.3989, 13.0808],
    'Östersund': [63.1792, 14.6357],
    
    // Västerbottens län (15)
    'Bjurholm': [63.9419, 19.3239],
    'Dorotea': [64.2619, 16.4133],
    'Lycksele': [64.5986, 18.6744],
    'Malå': [65.1847, 18.7000],
    'Nordmaling': [63.5686, 19.5031],
    'Norsjö': [65.1178, 19.4836],
    'Robertsfors': [64.1983, 20.8322],
    'Skellefteå': [64.7506, 20.9525],
    'Sorsele': [65.5361, 17.5311],
    'Storuman': [65.0989, 17.1131],
    'Umeå': [63.8258, 20.2630],
    'Vilhelmina': [64.6211, 16.6572],
    'Vindeln': [64.2000, 19.7167],
    'Vännäs': [63.9097, 19.7586],
    'Åsele': [64.1650, 17.3478],
    
    // Norrbottens län (14)
    'Arjeplog': [66.0511, 17.8878],
    'Arvidsjaur': [65.5903, 19.1758],
    'Boden': [65.8250, 21.6889],
    'Gällivare': [67.1333, 20.6500],
    'Haparanda': [65.8372, 24.1378],
    'Jokkmokk': [66.6053, 19.8269],
    'Kalix': [65.8572, 23.1525],
    'Kiruna': [67.8558, 20.2253],
    'Luleå': [65.5848, 22.1547],
    'Pajala': [67.2117, 23.3739],
    'Piteå': [65.3178, 21.4789],
    'Älvsbyn': [65.6764, 21.0031],
    'Överkalix': [66.3236, 22.8489],
    'Övertorneå': [66.3906, 23.6497]
};
