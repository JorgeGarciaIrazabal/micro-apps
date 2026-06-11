export const content = {
  en: {
    tripMeta: {
      title: 'Andalucía Real-Estate Scouting Trip (Granada & Southern Loop)',
      dates: '12–15 August 2026 (4 nights)',
      party: '5 people · 1 young child',
      vehicle: 'Mercedes V-Class 7-seater (Android Auto)',
      origin: 'Madrid Atocha',
      return: 'Madrid Atocha — Saturday evening',
      flyOut: 'Early Sunday 16 August 2026',
      researchDate: 'June 2026',
    },
    overview: {
      goal:
        'Evaluate family retirement locations focusing on condos and easy parking in Granada (Las Gabias, Churriana, Alhendín) under €380k. Compare with Málaga Coast (Torre del Mar, Rincón de la Victoria, Vélez-Málaga) and Bormujos (Sevilla - suburban base).',
      clusters: [
        {
          id: 'granada',
          name: 'Granada Vega (Primary Goal)',
          nights: 2,
          base: 'Alhendín / Las Gabias',
          strongFor: [
            'Condos/Apartments (€120k–€220k) — way under the €380k budget limit',
            'Cooler mountain air (Sierra Nevada) & lower summer nights',
            'Spacious modern avenues with excellent street and garage parking',
            'Granada Metro connection (easy access to city center without driving)'
          ],
        },
        {
          id: 'coast',
          name: 'Málaga Coast (Torre del Mar, Rincón, Vélez)',
          nights: 0,
          base: 'On the road (scouting)',
          strongFor: [
            'Beachfront lifestyle in Torre del Mar & Rincón de la Victoria',
            'Temperate coastal climate (cooler in summer than Seville)',
            'Highly affordable inland condos in Vélez-Málaga (€120k–€180k)',
            'Modern suburbs with wide avenues and spacious parking in Rincón'
          ],
        },
        {
          id: 'sevilla',
          name: 'Sevilla Aljarafe (Bormujos)',
          nights: 1,
          base: 'Bormujos (Sevilla)',
          strongFor: [
            'Modern suburban condo developments (€180k–€260k)',
            'Extremely vehicle-friendly layout (wide avenues, large shopping lots)',
            '15 mins to Sevilla center (utilizing Metro park-and-ride to avoid city parking)'
          ],
        },
      ],
    },
    townsComparison: [
      {
        name: 'Las Gabias',
        province: 'Granada',
        price: '€ (Very Cheap)',
        climate: 'Warm days, cool mountain nights',
        parking: 'Excellent street parking & modern garages',
        video: 'https://www.youtube.com/results?search_query=vivir+en+las+gabias+granada+residencial',
        images: 'https://www.google.com/search?tbm=isch&q=las+gabias+granada+residencial+calles',
        pros: [
          'Most affordable properties in the Granada belt (condos under €150k)',
          'Future Metro extension will connect it directly to Granada city',
          'Quiet suburban feel bordering the Granada Club de Golf'
        ],
        cons: [
          'Relies more on a car for daily chores until the metro arrives',
          'Fewer walking-distance dining options compared to Churriana'
        ]
      },
      {
        name: 'Churriana de la Vega',
        province: 'Granada',
        price: '€€ (Cheap)',
        climate: 'Warm days, cool mountain nights',
        parking: 'Superb in the new "Vial" zone; extremely tight in historic core',
        video: 'https://www.youtube.com/results?search_query=vivir+en+churriana+de+la+vega+granada',
        images: 'https://www.google.com/search?tbm=isch&q=churriana+de+la+vega+vial+nuevo+calles',
        pros: [
          'Highly flat and pedestrian-friendly layout',
          'Granada Metro construction is active (excellent future connectivity)',
          'Vibrant local town life with schools, shops, and cafes'
        ],
        cons: [
          'V-Class van cannot navigate the historic center',
          'Higher property prices than neighboring Las Gabias'
        ]
      },
      {
        name: 'Alhendín',
        province: 'Granada',
        price: '€ (Very Cheap)',
        climate: 'Slightly cooler due to mountain foothills altitude',
        parking: 'Very easy; wide streets in modern urbanizaciones',
        video: 'https://www.youtube.com/results?search_query=vivir+en+alhendin+granada',
        images: 'https://www.google.com/search?tbm=isch&q=alhendin+granada+los+llanos+calles',
        pros: [
          'Outstanding detached villa value-for-money (€240k–€340k)',
          'Immediate, hassle-free access to the A-44 highway',
          'Very close to primary amenities and quiet neighborhoods'
        ],
        cons: [
          'Almost entirely car-dependent for groceries and city trips',
          'Lacks a direct metro connection (relying on Armilla park-and-ride)'
        ]
      },
      {
        name: 'Torre del Mar',
        province: 'Málaga',
        price: '€€€ (Moderate)',
        climate: 'Temperate maritime sea breezes; escapes extreme heat',
        parking: 'Good in Poniente beach area; extremely congested in summer',
        video: 'https://www.youtube.com/results?search_query=retire+in+torre+del+mar+malaga+living',
        images: 'https://www.google.com/search?tbm=isch&q=torre+del+mar+poniente+avenida+beach',
        pros: [
          'Flat walkability to the beach and 4 km seafront promenade',
          'Established year-round international expat community',
          'Mild winter temperatures (warmer than Granada)'
        ],
        cons: [
          'Highest property prices in the scouting loop (€240k–€320k for condos)',
          'Very busy and noisy during peak summer months (July/August)'
        ]
      },
      {
        name: 'Rincón de la Victoria',
        province: 'Málaga',
        price: '€€€ (Moderate)',
        climate: 'Temperate coastal Mediterranean air; mild all year',
        parking: 'Good in Añoreta/Cotomar; tight along beachfront and old core',
        video: 'https://www.youtube.com/results?search_query=vivir+en+rincon+de+la+victoria+malaga',
        images: 'https://www.google.com/search?tbm=isch&q=rincon+de+la+victoria+anoreta+calles',
        pros: [
          'Direct beachfront access without the heavy tourist crowds of Western Málaga',
          'Only 15 minutes east of Málaga city center (easy drive)',
          'Modern residential zones with wide avenues and spacious sidewalks'
        ],
        cons: [
          'Properties are higher priced (€220k–€320k for 3-bed condos)',
          'High summer traffic along the coastal avenue'
        ]
      },
      {
        name: 'Vélez-Málaga',
        province: 'Málaga',
        price: '€ (Very Cheap)',
        climate: 'Mild Mediterranean climate; escapes coastal marine dampness',
        parking: 'Excellent in northwest expansions; very tight in historic core',
        video: 'https://www.youtube.com/results?search_query=vivir+en+velez+malaga',
        images: 'https://www.google.com/search?tbm=isch&q=velez+malaga+el+ingenio+expansion',
        pros: [
          'Highly affordable (3-bed condos around €120k–€180k, comparable to Granada)',
          'Traditional working town with active local shops, schools, and services',
          'Only 5 minutes drive to Torre del Mar beaches'
        ],
        cons: [
          'Inland town; no direct walking access to the beach',
          'Historic center streets are extremely narrow and unnavigable for a van'
        ]
      },
      {
        name: 'Bormujos',
        province: 'Sevilla',
        price: '€€ (Cheap)',
        climate: 'Extreme summer heat (often exceeding 40°C in August)',
        parking: 'Excellent; built as a modern vehicle-centric suburb',
        video: 'https://www.youtube.com/results?search_query=vivir+en+bormujos+sevilla+aljarafe',
        images: 'https://www.google.com/search?tbm=isch&q=bormujos+sevilla+avenidas+residencial',
        pros: [
          'Spacious modern avenues and large parking lots',
          'Excellent suburban services, supermarkets, and shopping malls',
          'Only 15 minutes from Sevilla city center'
        ],
        cons: [
          'Extreme dry heat makes outdoor life difficult in summer',
          'Commuting to central Sevilla is slow if driving (must use Metro)'
        ]
      }
    ],
    days: [
      {
        id: 'd1',
        number: 1,
        weekday: 'Wednesday',
        date: '12 Aug',
        title: 'Madrid → Granada Vega (Las Gabias & Alhendín)',
        subtitle: 'Drive day + evening orientation in Granada suburban towns',
        driveKm: 430,
        driveHours: 4.2,
        padel: false,
        sections: [
          {
            time: '09:00',
            kind: 'departure',
            title: 'Pick up van at Madrid Atocha Station',
            note: 'Mercedes V-Class 7-seater. Confirm child seat is correctly installed and Android Auto is paired for navigation before departing.',
          },
          {
            time: '10:00',
            kind: 'drive',
            title: 'A-4 south → A-44 south to Granada Vega',
            note: '~430 km / 4 hours with one major family rest stop. A-4 and A-44 are completely toll-free.',
          },
          {
            time: '12:00',
            kind: 'lunch',
            title: 'Venta El Cordobés (Bailén / Jaén)',
            note: 'Perfect mid-point family lunch stop. Huge parking lot for a van, traditional children-friendly menus, and rapid service. Allow 45 minutes.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Venta+El+Cordobes+Bailen+Jaen+restaurante',
          },
          {
            time: '14:30',
            kind: 'checkin',
            title: 'Check-in: Granada Vega Base Villa (Alhendín / Las Gabias)',
            note: 'First 2 nights. Ensure the villa has a wide driveway for the 7-seater van and check that air conditioning is active in all bedrooms for the child.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Las+Gabias+Granada+Spain+accommodation',
          },
          {
            time: '15:30',
            kind: 'supermarket',
            title: 'Stock up: Mercadona Las Gabias',
            note: 'Located on Calle Real. Features large, family-friendly underground parking. Buy bottled water, breakfast essentials, and snacks for the baby.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercadona+Calle+Real+Las+Gabias',
          },
          {
            time: '16:30',
            kind: 'scout',
            title: 'Las Gabias — Condo & Parking Scouting',
            note: 'Scout the residential districts of Híjar, Las Tejeras, and around the Granada Club de Golf. Las Gabias is cheap, flat, and features a future metro link extension. Notice the wide streets and easy street parking in the newer sectors.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Granada+Club+de+Golf+Las+Gabias',
          },
          {
            time: '20:30',
            kind: 'dinner',
            title: 'Restaurante Los Naranjos (Alhendín)',
            note: 'Excellent family-friendly restaurant with a spacious outdoor dining patio, local cuisine, and easy parking for large vehicles.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Restaurante+Los+Naranjos+Alhendin+Granada',
          },
        ],
      },
      {
        id: 'd2',
        number: 2,
        weekday: 'Thursday',
        date: '13 Aug',
        title: 'Granada Vega Loop — Churriana & Alhendín',
        subtitle: 'Deep dive into Granada’s most retirement-friendly suburbs under €380k',
        driveKm: 40,
        driveHours: 1.2,
        padel: false,
        sections: [
          {
            time: '09:30',
            kind: 'scout',
            title: 'Churriana de la Vega — Metro Corridor & Condo Scouting',
            note: 'Churriana is highly popular due to its flat landscape and the ongoing Granada Metro extension. Scout the modern "Vial de Churriana" district. Condos here go for €120k–€200k (with parking garage options). Notice how wide the avenues are for double parking or guest spaces.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Churriana+de+la+Vega+Granada+Spain',
          },
          {
            time: '11:30',
            kind: 'scout',
            title: 'Alhendín — Condo Complex & Parking Audit',
            note: 'Scout new condo blocks on the edge of the A-44 highway. These complexes feature modern underground parking layouts and wide, quiet streets with abundant free curbside parking.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Alhendin+Granada+Spain',
          },
          {
            time: '13:45',
            kind: 'lunch',
            title: 'Restaurante Mesón El Ventorrillo',
            note: 'Located on the edge of Churriana. Traditional Andalusian grilled meats, highly welcoming of children, and features a huge parking lot.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Meson+El+Ventorrillo+Churriana+de+la+Vega+restaurante',
          },
          {
            time: '15:30',
            kind: 'showhome',
            title: 'Obra Nueva: Residencial Triana (Las Gabias) & Vial (Churriana)',
            note: 'Do a street scout of new-build townhouse and condo sites. Residencial Triana features adosados from €259k. Churriana Vial builds start around €329k with private pools.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Residencial+Triana+Las+Gabias',
          },
          {
            time: '17:30',
            kind: 'scout',
            title: 'Granada Metro Station Check (Armilla / Fernando de los Ríos)',
            note: 'Check the park-and-ride station near Nevada Shopping Center. This is where retirees from Alhendín/Las Gabias park to hop on the metro to Granada city center in 15 mins.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Nevada+Shopping+Granada',
          },
          {
            time: '20:30',
            kind: 'dinner',
            title: 'Dinner at Base Villa or local Granada tapas',
            note: 'Enjoy a relaxed dinner at the villa or check out family-friendly plazas in Armilla.',
          },
        ],
      },
      {
        id: 'd3',
        number: 3,
        weekday: 'Friday',
        date: '14 Aug',
        title: 'Granada → Málaga Coast (Vélez, Torre del Mar, Rincón) → Sevilla (Bormujos)',
        subtitle: 'Relocation day: Compare coastal Axarquía/Málaga with Seville’s premier family suburbs',
        driveKm: 375,
        driveHours: 4.0,
        padel: false,
        sections: [
          {
            time: '08:30',
            kind: 'checkin',
            title: 'Check out of Granada base → Drive to Torre del Mar (1h 15m)',
            note: 'Scenic drive down A-44 towards the coast, then A-7 east to Torre del Mar (115 km).',
          },
          {
            time: '09:45',
            kind: 'scout',
            title: 'Torre del Mar — Seafront Condo & Public Parking Check',
            note: 'Walk the Paseo Marítimo. Evaluate the large public dirt parking lots near the beach and lighthouse. Check the Poniente beach modern condo complexes. Properties (3-bed condos) under €380k are highly common here (€240k–€320k) and include underground garages.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Paseo+Maritimo+Torre+del+Mar+Malaga',
          },
          {
            time: '10:45',
            kind: 'scout',
            title: 'Vélez-Málaga — Inland Modern Expansion Audit',
            note: 'Drive 5 mins inland. Evaluate the wide avenues, modern condos (€120k–€180k), and massive parking lots around El Ingenio shopping mall. Highly driveable outside the historic core.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Centro+Comercial+El+Ingenio+Velez+Malaga',
          },
          {
            time: '11:45',
            kind: 'scout',
            title: 'Scout: Caleta de Vélez Marina & Parking',
            note: 'Caleta de Vélez has a quieter port vibe, easy parking in the marina lot, and excellent coastal condos with easy access to the highway.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Puerto+de+Caleta+de+Velez+Malaga',
          },
          {
            time: '12:45',
            kind: 'lunch',
            title: 'Chiringuito El Playazo (Torre del Mar)',
            note: 'Authentic beachside chiringuito. Known for fresh espetos (sardine skewers), paella, and kid-friendly atmosphere right on the sand. Flat public parking nearby.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Chiringuito+El+Playazo+Torre+del+Mar+restaurante',
          },
          {
            time: '14:00',
            kind: 'scout',
            title: 'Scout: Rincón de la Victoria (Añoreta & Promenade)',
            note: 'Drive 20 mins west. Evaluate the modern layout, easy access parking, and sea-view family condos (€220k–€320k) with garages in Añoreta/Cotomar expansions.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Rincon+de+la+Victoria+Paseo+Maritimo',
          },
          {
            time: '14:45',
            kind: 'drive',
            title: 'Rincón de la Victoria → Bormujos (Sevilla) via A-7 / A-92',
            note: 'Drive inland via A-7 and A-92 (225 km / 2 hours 30 mins). Sevilla will be hot in the afternoon — ensure the van AC is fully operational.',
          },
          {
            time: '17:15',
            kind: 'checkin',
            title: 'Check-in: Bormujos Base Villa (Sevilla Aljarafe)',
            note: 'Final night base. Park V-Class and check the cooling system. Ensure the pool is operational for a refreshing splash.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Bormujos+Sevilla+Spain+accommodation',
          },
          {
            time: '17:50',
            kind: 'scout',
            title: 'Bormujos — Suburban Aljarafe Walkthrough & Parking Audit',
            note: 'Scout Bormujos suburban avenues, local family parks, and supermarket layout (Mercadona Bormujos). Check townhouse/condo developments around Avenida San Juan de Dios (pricing: €230k–€340k). Verify easy roadside parking.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercadona+Avenida+San+Juan+de+Dios+Bormujos',
          },
          {
            time: '20:30',
            kind: 'dinner',
            title: 'Dinner: Venta Pazo (Sanlúcar la Mayor outskirts)',
            note: 'Just a 10 min drive from Bormujos. Historic family-friendly venta featuring a massive garden, play areas, and easy parking.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Venta+Pazo+Sanlucar+la+Mayor+restaurante',
          },
        ],
      },
      {
        id: 'd4',
        number: 4,
        weekday: 'Saturday',
        date: '15 Aug',
        title: 'Sevilla Scouting + Return to Madrid',
        subtitle: 'Transit check, final town audit, and the long drive north to Madrid',
        driveKm: 540,
        driveHours: 5.0,
        padel: false,
        sections: [
          {
            time: '10:30',
            kind: 'checkin',
            title: 'Check out of Sevilla villa → drive to Mairena del Aljarafe',
            note: 'Pack all luggage into the Mercedes V-Class.',
          },
          {
            time: '11:00',
            kind: 'scout',
            title: 'Scout: Ciudad Expo Metro Park-and-Ride (Mairena del Aljarafe)',
            note: 'Inspect the massive park-and-ride lot next to the Metro terminal. This is where Aljarafe residents park their cars for free to take the Metro directly into central Seville, bypassing the city center parking nightmare.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Ciudad+Expo+Metro+Sevilla',
          },
          {
            time: '12:00',
            kind: 'scout',
            title: 'Final Condo Scout — Bormujos / Tomares',
            note: 'Check modern condo blocks in Tomares and Bormujos. Notice that almost all buildings feature double-basement garages. Rate Bormujos’ ease of vehicle movement.',
          },
          {
            time: '13:30',
            kind: 'lunch',
            title: 'Venta La Masía (Bollullos de la Mitación)',
            note: 'Family-friendly rustic restaurant, huge parking lot, quick kids meals before starting the long highway drive.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Venta+La+Masia+Bollullos+de+la+Mitacion+restaurante',
          },
          {
            time: '14:30',
            kind: 'drive',
            title: 'Sevilla → Madrid via A-4 North',
            note: '530 km, ~5 hours drive. High temperature during afternoon — check tire pressure and coolant level.',
          },
          {
            time: '17:30',
            kind: 'rest',
            title: 'Refuel & Rest: Repsol Service Area (Manzanares, Ciudad Real)',
            note: 'A-4 km 173. Clean restrooms, child-friendly play space, large truck/van parking.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Area+de+servicio+Manzanares+A-4+Repsol',
          },
          {
            time: '20:00',
            kind: 'arrival',
            title: 'Arrive Madrid Atocha → Drop off V-Class → Hotel check-in',
            note: 'Drop off rental vehicle. Prepare for flight home on Sunday morning.',
          },
        ],
      },
    ],
    obraNueva: [
      { name: 'Residencial Triana', developer: 'Gralusa / Local Developers', type: '3-4 Bed Townhouses with Pool Option', units: 35, priceFrom: '€259,000', handover: '2026/2027', area: 'Barrio Alto-Híjar, Las Gabias', day: 2, maps: 'https://www.google.com/maps/search/?api=1&query=Las+Gabias+Granada+new+builds' },
      { name: 'Residencial Hoyo 15', developer: 'Gralusa', type: 'Premium Semi-Detached Villas (Frontline Golf)', units: 20, priceFrom: '€350,000', handover: 'Dec 2026', area: 'Granada Club de Golf, Las Gabias', day: 2, maps: 'https://www.google.com/maps/search/?api=1&query=Granada+Club+de+Golf+Las+Gabias' },
      { name: 'Vial de Churriana Townhouses', developer: 'Navygar / Local Promoters', type: '3-Bed Modern Chalets with Private Pool', units: 15, priceFrom: '€329,000', handover: 'June 2026+', area: 'Vial de Churriana de la Vega', day: 2, maps: 'https://www.google.com/maps/search/?api=1&query=Churriana+de+la+Vega+Granada+new+builds' },
      { name: 'Azure Living', developer: 'Salsa Inmobiliaria', type: 'Modern Apartments 2-3 Bed (Near Beach)', units: 48, priceFrom: '€295,575', handover: 'TBC', area: 'Poniente Area, Torre del Mar', day: 3, maps: 'https://www.google.com/maps/search/?api=1&query=Torre+del+Mar+Azure+Living' },
      { name: 'Horus V', developer: 'Salsa Inmobiliaria', type: 'Apartments & Penthouses 1-3 Bed', units: 80, priceFrom: '€378,000 (Top Units)', handover: 'Late 2026', area: 'Poniente Beach, Torre del Mar', day: 3, maps: 'https://www.google.com/maps/search/?api=1&query=Horus+V+Torre+del+Mar' },
      { name: 'Alma Bormujos', developer: 'Grupo Q', type: 'Apartments 1-4 Bed (Gated Community)', units: 62, priceFrom: '€260,000', handover: '2027', area: 'Suburban Corridor, Bormujos (Sevilla)', day: 4, maps: 'https://www.google.com/maps/search/?api=1&query=Alma+Bormujos+Grupo+Q' },
    ],
    parkingInfo: [
      { town: 'Las Gabias (Granada)', parkingScore: '⭐⭐⭐⭐⭐ Excellent', difficulty: 'Very Low', note: 'New development areas (Golf & Híjar) have wide 10–12m avenues with abundant free street parking. Almost 100% of condos built after 2005 include secure underground parking spaces.' },
      { town: 'Alhendín (Granada)', parkingScore: '⭐⭐⭐⭐⭐ Excellent', difficulty: 'Very Low', note: 'Extremely car-friendly with direct A-44 highway access. Outskirts and modern complexes (Los Llanos) feature wide-open streets. Extremely easy to park 2 cars anywhere near the residential blocks.' },
      { town: 'Churriana de la Vega (Granada)', parkingScore: '⭐⭐⭐⭐ Good (New Zone)', difficulty: 'Medium-Low', note: 'The new "Vial" zone is characterized by wide boulevards and easy curbside parking. However, the historical core has extremely narrow streets where driving and parking a V-Class is highly discouraged.' },
      { town: 'Torre del Mar (Málaga)', parkingScore: '⭐⭐⭐ Moderate (Summer Peak)', difficulty: 'Medium-High', note: 'Modern Poniente zone has wide streets and large public dirt parking lots near the beach. However, in summer (August), guest street parking is packed. Private underground garage spaces are mandatory.' },
      { town: 'Rincón de la Victoria (Málaga)', parkingScore: '⭐⭐⭐⭐ Good (New Zone)', difficulty: 'Medium', note: 'Añoreta and Cotomar expansion zones have wide roads and easy parking. However, the coastal front is highly congested during summer peak hours. Real estate purchases must include a private garage space.' },
      { town: 'Vélez-Málaga (Málaga)', parkingScore: '⭐⭐⭐⭐ Good', difficulty: 'Medium-Low', note: 'Modern northwest zones and areas surrounding El Ingenio mall have very wide roads and massive free parking lots. Historic core has extremely narrow one-way streets.' },
      { town: 'Bormujos (Sevilla)', parkingScore: '⭐⭐⭐⭐⭐ Excellent', difficulty: 'Very Low', note: 'Built as a modern suburban car-centric town. Wide streets, massive free shopping center parking lots. Metro park-and-ride (Ciudad Expo) is adjacent and has massive capacity.' },
    ],
    supermarkets: [
      { name: 'Mercadona Las Gabias', cluster: 'granada', address: 'Calle Real s/n, Las Gabias', note: 'Closest option for Las Gabias; has large underground parking.' },
      { name: 'Lidl Armilla', cluster: 'granada', address: 'Av. Fernando de los Ríos s/n, Armilla', note: 'Largest supermarket formats located right next to the Nevada Shopping Mall.' },
      { name: 'Mercadona Churriana', cluster: 'granada', address: 'Calle Ramon y Cajal, Churriana de la Vega', note: 'Highly accessible, kid-friendly parking.' },
      { name: 'Mercadona Bormujos', cluster: 'sevilla', address: 'Avenida San Juan de Dios s/n, Bormujos', note: 'Convenient Aljarafe location with wide parking spots.' },
      { name: 'Lidl Bormujos', cluster: 'sevilla', address: 'Avenida de la Universidad, Bormujos', note: 'Next to the CEU San Pablo university complex.' },
      { name: 'Mercadona Torre del Mar', cluster: 'coast', address: 'Calle Pintor Cipriano Maldonado s/n, Torre del Mar', note: 'Large coastal Mercadona, busy in high summer.' },
    ],
    bases: [
      {
        name: 'Granada Vega (Alhendín / Las Gabias)',
        nights: 'Nights 1 & 2 (Wed 12 + Thu 13 Aug)',
        why: 'Quiet, residential, very close to the 3 target towns. Offers private pool villas at a fraction of coastal costs. Safe parking for a large 7-seater van.',
        filters: '"Las Gabias" or "Alhendín" + "villa" + "private pool" + "parking"',
        priceBand: '€180–€280/night (3-4 bed villa with pool in August — highly competitive)',
        caution: 'Check if AC is fully operational in all bedrooms. Summer nights in Granada are cooler than Málaga/Sevilla due to altitude, but still require AC.',
      },
      {
        name: 'Sevilla Aljarafe (Bormujos / Tomares)',
        nights: 'Night 3 (Fri 14 Aug)',
        why: 'Perfect launchpad for Day 4 vehicle audits and highway access. Close to A-4 highway for an easy drive back to Madrid on Saturday afternoon.',
        filters: '"Bormujos" or "Tomares" + "villa" + "private pool" + "parking"',
        priceBand: '€200–€300/night (3-4 bed villa with pool)',
        caution: 'August temperatures in Sevilla regularly exceed 40°C in the afternoon. Pool access and 24h AC are mandatory for the child’s safety.',
      },
    ],
    restaurants: [
      { name: 'Venta El Cordobés', when: 'Day 1 lunch (en route)', area: 'Bailén / Jaén (A-4 km 295)' },
      { name: 'Restaurante Los Naranjos', when: 'Day 1 dinner', area: 'Alhendín, Granada' },
      { name: 'Restaurante Mesón El Ventorrillo', when: 'Day 2 lunch', area: 'Churriana de la Vega, Granada' },
      { name: 'Chiringuito El Playazo', when: 'Day 3 lunch', area: 'Torre del Mar beach, Málaga' },
      { name: 'Venta Pazo', when: 'Day 3 dinner', area: 'Sanlúcar la Mayor (near Bormujos), Sevilla' },
      { name: 'Venta La Masía', when: 'Day 4 lunch', area: 'Bollullos de la Mitación, Sevilla' },
    ],
    terrenos: {
      rules: [
        'Urban plots (Suelo Urbano): Full permissions to build. Build permissions are identical for modular or traditional construction.',
        'Suelo Rústico: Generally requires 25,000+ m² to build a single house in Andalusia. Strongly avoid this for a simple retirement build.',
        'Granada Vega municipalities feature fast building license turnarounds (typically 3–6 months) compared to the slow coastal municipalities (9–18 months).',
        'Expect around €100–€200/m² for urban buildable land in Alhendín or Las Gabias.',
      ],
      inland: [
        { name: 'Alhendín Urbanizations', municipality: 'Alhendín (Granada)', price: '€120–€180/m²', note: 'Best terrain for custom villa building. Flat plots, fully paved roads, immediate highway access.' },
        { name: 'Las Gabias Golf Slopes', municipality: 'Las Gabias (Granada)', price: '€100–€160/m²', note: 'Slight slopes with great Sierra Nevada and golf course views.' },
        { name: 'Churriana de la Vega', municipality: 'Churriana (Granada)', price: '€150–€220/m²', note: 'Extremely scarce urban plots due to high density and metro expansion.' },
        { name: 'Bormujos Aljarafe', municipality: 'Bormujos (Sevilla)', price: '€180–€260/m²', note: 'High demand from local developers. Good value but check occupancy coefficients.' },
      ],
      coast: [
        { name: 'Torre del Mar Outskirts', municipality: 'Vélez-Málaga', price: '€200–€300/m²', note: 'Limited urban plots left near the beach. Most plots are 3-5 km inland.' },
      ],
      western: [],
    },
    resaleClusters: [
      {
        cluster: 'Granada Vega (Primary Goal)',
        subtitle: 'Exceptional value for family retirement (budget under €380k)',
        entries: [
          { urbanization: 'Las Gabias (Híjar / Golf)', type: '3-Bed Modern Condo / Golf Apartment', price: '€110,000–€170,000' },
          { urbanization: 'Churriana de la Vega (New Vial)', type: '3-Bed Modern Apartment with Garage', price: '€120,000–€180,000' },
          { urbanization: 'Alhendín (La Masía / Los Llanos)', type: '3-Bed Penthouse with Large Terrace', price: '€130,000–€195,000' },
          { urbanization: 'Armilla (Metro border)', type: '3-Bed Condo near Metro Station', price: '€140,000–€210,000' },
        ],
      },
      {
        cluster: 'Málaga Eastern Coast',
        subtitle: 'Flat coastal resort environment',
        entries: [
          { urbanization: 'Torre del Mar (Poniente Beach)', type: '3-Bed Modern Apartment near Promenade', price: '€240,000–€320,000' },
          { urbanization: 'Rincón de la Victoria (Añoreta)', type: '3-Bed Apartment with Sea View & Pool', price: '€220,000–€310,000' },
          { urbanization: 'Vélez-Málaga (El Ingenio zone)', type: '3-Bed Modern Condo with Parking', price: '€120,000–€180,000' },
          { urbanization: 'Torre del Mar (Outskirts)', type: '3-Bed Semi-Detached Villa', price: '€300,000–€380,000' },
          { urbanization: 'Caleta de Vélez (Golf)', type: '3-Bed Townhouse near Marina & Golf', price: '€280,000–€360,000' },
        ],
      },
      {
        cluster: 'Sevilla Aljarafe',
        subtitle: 'Premier residential commuter suburbs',
        entries: [
          { urbanization: 'Bormujos (Av. Universidad)', type: '3-Bed Condo / Apartment with Garage', price: '€150,000–€220,000' },
          { urbanization: 'Tomares (Bordering Bormujos)', type: '3-Bed Modern Condo in Gated Community', price: '€190,000–€270,000' },
          { urbanization: 'Bollullos de la Mitación', type: '4-Bed Villa near CBS British School', price: '€230,000–€340,000' },
        ],
      },
    ],
    questions: {
      obraNueva: [
        'Does the quote include 10% IVA, registration, and notary fees (budget around 11–12% extra)?',
        'Is the garage space and storage unit included in the advertised price (crucial in Torre del Mar and Bormujos)?',
        'What is the developer’s exact bank guarantee structure in case of construction delays?',
        'What are the estimated monthly community fees for the shared pool and garden maintenance?',
      ],
      terreno: [
        'Is the plot classified as Suelo Urbano Consolidado (permits immediate build)?',
        'Are there utility connection fees (electricity, water, sewage) already paid to the town hall?',
        'Are there any regional or local oak-tree (encina) protection orders on the property?',
        'For modular homes, does the municipal PGOU accept Declaración Responsable for rapid licensing?',
      ],
      resale: [
        'Are the property’s extensions and pools fully registered in the Nota Simple and Catastro?',
        'What was the exact year of the last structural renovation (plumbing, wiring, roof)?',
        'What are the annual property tax (IBI) costs and community fees?',
        'Does the seller possess a valid Cédula de Habitabilidad (Habitation License)?',
      ],
    },
    caveats: [
      'August closures in Andalucia — call developer sales offices and restaurants 48 hours in advance. August is peak holidays for Spanish agents.',
      'Extreme Seville Heat — August temperatures in Sevilla and Bormujos regularly reach 42°C. Ensure your rental bases and cars have outstanding air conditioning.',
      'Legal and tax counsel — when buying resale property in Spain, hire a local independent lawyer (abogado) to verify the status of the property. Budget 1% of the purchase price for legal fees.',
    ],
  },
  es: {
    tripMeta: {
      title: 'Viaje de Reconocimiento Inmobiliario en Andalucía (Granada y Bucle Sur)',
      dates: '12–15 de agosto de 2026 (4 noches)',
      party: '5 personas · 1 niño pequeño',
      vehicle: 'Mercedes Clase V de 7 plazas (Android Auto)',
      origin: 'Madrid Atocha',
      return: 'Madrid Atocha — Sábado por la tarde',
      flyOut: 'Domingo temprano 16 de agosto de 2026',
      researchDate: 'Junio de 2026',
    },
    overview: {
      goal:
        'Evaluar ubicaciones para jubilación familiar centradas en apartamentos y estacionamiento fácil en Granada (Las Gabias, Churriana, Alhendín) bajo 380k. Comparar con Costa de Málaga (Torre del Mar, Rincón de la Victoria, Vélez-Málaga) y Bormujos (Sevilla - base suburbana).',
      clusters: [
        {
          id: 'granada',
          name: 'Granada Vega (Objetivo Principal)',
          nights: 2,
          base: 'Alhendín / Las Gabias',
          strongFor: [
            'Apartamentos (€120k–€220k) — muy por debajo del límite de 380.000 €',
            'Aire de montaña más fresco (Sierra Nevada) y noches más templadas',
            'Avenidas amplias y modernas con excelente aparcamiento libre y garaje',
            'Conexión con el Metro de Granada (fácil acceso al centro sin conducir)'
          ],
        },
        {
          id: 'coast',
          name: 'Costa de Málaga (Torre del Mar, Rincón, Vélez)',
          nights: 0,
          base: 'En ruta (scouting)',
          strongFor: [
            'Estilo de vida frente al mar en Torre del Mar y Rincón de la Victoria',
            'Clima templado costero (más fresco en verano que Sevilla)',
            'Apartamentos de interior muy económicos en Vélez-Málaga (€120k–€180k)',
            'Suburbios modernos con avenidas anchas y parking amplio en Rincón'
          ],
        },
        {
          id: 'sevilla',
          name: 'Sevilla Aljarafe (Bormujos)',
          nights: 1,
          base: 'Bormujos (Sevilla)',
          strongFor: [
            'Promociones modernas de apartamentos suburbanos (€180k–€260k)',
            'Diseño muy cómodo para vehículos (avenidas amplias, grandes parkings)',
            'A 15 min de Sevilla centro (usando park-and-ride del metro para evitar aparcar)'
          ],
        },
      ],
    },
    townsComparison: [
      {
        name: 'Las Gabias',
        province: 'Granada',
        price: '€ (Muy Barato)',
        climate: 'Días calurosos, noches frescas de montaña',
        parking: 'Excelente en la calle y garajes modernos',
        video: 'https://www.youtube.com/results?search_query=vivir+en+las+gabias+granada+residencial',
        images: 'https://www.google.com/search?tbm=isch&q=las+gabias+granada+residencial+calles',
        pros: [
          'Viviendas más económicas del cinturón de Granada (pisos bajo 150k)',
          'Próxima ampliación del Metro lo conectará directo con Granada',
          'Ambiente residencial tranquilo junto al Granada Club de Golf'
        ],
        cons: [
          'Mayor dependencia del coche para compras hasta la llegada del metro',
          'Menor oferta gastronómica a pie de calle que en Churriana'
        ]
      },
      {
        name: 'Churriana de la Vega',
        province: 'Granada',
        price: '€€ (Barato)',
        climate: 'Días calurosos, noches frescas de montaña',
        parking: 'Excelente en la zona del "Vial"; intransitable en el casco antiguo',
        video: 'https://www.youtube.com/results?search_query=vivir+en+churriana+de+la+vega+granada',
        images: 'https://www.google.com/search?tbm=isch&q=churriana+de+la+vega+vial+nuevo+calles',
        pros: [
          'Municipio totalmente llano y cómodo para pasear',
          'Ampliación del Metro activa (magnífica conectividad futura)',
          'Vida de pueblo activa con comercios, colegios y cafeterías'
        ],
        cons: [
          'La furgoneta Clase V no cabe por las calles del casco antiguo',
          'Precios de vivienda ligeramente superiores a Las Gabias'
        ]
      },
      {
        name: 'Alhendín',
        province: 'Granada',
        price: '€ (Muy Barato)',
        climate: 'Ligeramente más fresco por la altitud al pie de la sierra',
        parking: 'Muy fácil; calles anchas en urbanizaciones modernas',
        video: 'https://www.youtube.com/results?search_query=vivir+en+alhendin+granada',
        images: 'https://www.google.com/search?tbm=isch&q=alhendin+granada+los+llanos+calles',
        pros: [
          'Excelente relación calidad-precio para chalets (€240k–€340k)',
          'Acceso inmediato y sin atascos a la autovía A-44',
          'Entorno residencial muy tranquilo y silencioso'
        ],
        cons: [
          'Dependencia del vehículo casi total para el día a día',
          'No cuenta con metro directo (requiere park-and-ride en Armilla)'
        ]
      },
      {
        name: 'Torre del Mar',
        province: 'Málaga',
        price: '€€€ (Moderado)',
        climate: 'Brisas marinas templadas; escapa al calor extremo',
        parking: 'Bueno en zona de Poniente; muy masificado en verano',
        video: 'https://www.youtube.com/results?search_query=retire+in+torre+del+mar+malaga+living',
        images: 'https://www.google.com/search?tbm=isch&q=torre+del+mar+poniente+avenida+beach',
        pros: [
          'Llano y cómodo para ir a pie a la playa y al paseo de 4 km',
          'Comunidad internacional de jubilados activa todo el año',
          'Temperaturas invernales suaves (más cálidas que Granada)'
        ],
        cons: [
          'Los precios de vivienda más altos de la ruta (pisos 240k–320k)',
          'Muy concurrido y ruidoso en temporada alta de verano (julio/agosto)'
        ]
      },
      {
        name: 'Rincón de la Victoria',
        province: 'Málaga',
        price: '€€€ (Moderado)',
        climate: 'Clima mediterráneo costero templado; suave todo el año',
        parking: 'Bueno en Añoreta/Cotomar; saturado en primera línea de playa',
        video: 'https://www.youtube.com/results?search_query=vivir+en+rincon+de+la+victoria+malaga',
        images: 'https://www.google.com/search?tbm=isch&q=rincon+de+la+victoria+anoreta+calles',
        pros: [
          'Acceso directo a la playa sin la masificación turística de Málaga Oeste',
          'A solo 15 minutos al este del centro de Málaga (carretera rápida)',
          'Zonas residenciales modernas con avenidas anchas y amplias aceras'
        ],
        cons: [
          'Precios de vivienda más elevados (€220k–€320k para pisos de 3 dorm.)',
          'Tráfico intenso en verano a lo largo de la avenida costera'
        ]
      },
      {
        name: 'Vélez-Málaga',
        province: 'Málaga',
        price: '€ (Muy Barato)',
        climate: 'Clima mediterráneo suave; evita la humedad marina directa',
        parking: 'Excelente en expansiones del noroeste; intransitables en casco antiguo',
        video: 'https://www.youtube.com/results?search_query=vivir+en+velez+malaga',
        images: 'https://www.google.com/search?tbm=isch&q=velez+malaga+el+ingenio+expansion',
        pros: [
          'Muy económico (pisos de 3 dorm. entre €120k–€180k, similar a Granada)',
          'Ciudad tradicional activa todo el año con todos los servicios y comercios',
          'A solo 5 minutos en coche de las playas de Torre del Mar'
        ],
        cons: [
          'Municipio de interior; no es posible ir a la playa a pie',
          'Las calles del casco histórico son extremadamente estrechas para la furgoneta'
        ]
      },
      {
        name: 'Bormujos',
        province: 'Sevilla',
        price: '€€ (Barato)',
        climate: 'Calor extremo en verano (superando los 40°C en agosto)',
        parking: 'Excelente; diseñado como suburbio moderno adaptado al coche',
        video: 'https://www.youtube.com/results?search_query=vivir+en+bormujos+sevilla+aljarafe',
        images: 'https://www.google.com/search?tbm=isch&q=bormujos+sevilla+avenidas+residencial',
        pros: [
          'Avenidas amplias y parkings libres de gran capacidad',
          'Excelentes servicios, centros comerciales y supermercados',
          'A solo 15 minutos del centro de Sevilla'
        ],
        cons: [
          'Calor seco extremo que limita la vida exterior en verano',
          'Tráfico denso hacia Sevilla en hora punta (requiere metro)'
        ]
      }
    ],
    days: [
      {
        id: 'd1',
        number: 1,
        weekday: 'Miércoles',
        date: '12 Ago',
        title: 'Madrid → Granada Vega (Las Gabias y Alhendín)',
        subtitle: 'Día de viaje en coche + orientación por la tarde en la periferia de Granada',
        driveKm: 430,
        driveHours: 4.2,
        padel: false,
        sections: [
          {
            time: '09:00',
            kind: 'departure',
            title: 'Recoger furgoneta en la estación de Madrid Atocha',
            note: 'Mercedes Clase V de 7 plazas. Confirmar que la silla infantil está correctamente instalada y que Android Auto funciona para la navegación antes de salir.',
          },
          {
            time: '10:00',
            kind: 'drive',
            title: 'A-4 sur → A-44 sur hacia Granada Vega',
            note: '~430 km / 4 horas con una parada principal de descanso familiar. La A-4 y la A-44 son totalmente libres de peaje.',
          },
          {
            time: '12:00',
            kind: 'lunch',
            title: 'Venta El Cordobés (Bailén / Jaén)',
            note: 'Parada ideal a mitad de camino. Parking amplio para la furgoneta, menús infantiles tradicionales y servicio rápido. Prever 45 minutos.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Venta+El+Cordobes+Bailen+Jaen+restaurante',
          },
          {
            time: '14:30',
            kind: 'checkin',
            title: 'Registro en el alojamiento: Villa base en Granada Vega (Alhendín / Las Gabias)',
            note: 'Primeras 2 noches. Asegurar que la villa tiene entrada amplia para la Clase V y verificar que el aire acondicionado funcione en todas las habitaciones.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Las+Gabias+Granada+Spain+accommodation',
          },
          {
            time: '15:30',
            kind: 'supermarket',
            title: 'Abastecimiento: Mercadona Las Gabias',
            note: 'Situado en la Calle Real. Cuenta con parking subterráneo amplio y cómodo para furgonetas. Comprar agua embotellada, desayuno y comida para el niño.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercadona+Calle+Real+Las+Gabias',
          },
          {
            time: '16:30',
            kind: 'scout',
            title: 'Reconocimiento en Las Gabias — Apartamentos y Aparcamiento',
            note: 'Recorrer las zonas residenciales de Híjar, Las Tejeras y alrededor del Club de Golf. Precios económicos, plano y con futura ampliación de metro. Observar las calles anchas y el fácil aparcamiento.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Granada+Club+de+Golf+Las+Gabias',
          },
          {
            time: '20:30',
            kind: 'dinner',
            title: 'Cena: Restaurante Los Naranjos (Alhendín)',
            note: 'Excelente restaurante familiar con gran patio exterior, cocina local y aparcamiento fácil para vehículos grandes.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Restaurante+Los+Naranjos+Alhendin+Granada',
          },
        ],
      },
      {
        id: 'd2',
        number: 2,
        weekday: 'Jueves',
        date: '13 Ago',
        title: 'Bucle de Granada Vega — Churriana y Alhendín',
        subtitle: 'Análisis detallado de la periferia más cómoda y barata de Granada (bajo 380k)',
        driveKm: 40,
        driveHours: 1.2,
        padel: false,
        sections: [
          {
            time: '09:30',
            kind: 'scout',
            title: 'Reconocimiento en Churriana de la Vega — Apartamentos y Metro',
            note: 'Muy demandado por su geografía llana y la ampliación del metro. Recorrer el distrito del "Vial". Apartamentos desde 120k–200k (con opción de garaje). Observar las amplias avenidas para aparcamiento.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Churriana+de+la+Vega+Granada+Spain',
          },
          {
            time: '11:30',
            kind: 'scout',
            title: 'Reconocimiento en Alhendín — Bloques de Apartamentos y Aparcamiento',
            note: 'Analizar los nuevos bloques de apartamentos cerca del enlace A-44. Cuentan con modernos garajes subterráneos y calles anchas y tranquilas con mucho aparcamiento libre.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Alhendin+Granada+Spain',
          },
          {
            time: '13:45',
            kind: 'lunch',
            title: 'Almuerzo: Restaurante Mesón El Ventorrillo',
            note: 'Situado a las afueras de Churriana. Carnes a la brasa tradicionales, muy familiar y con un aparcamiento enorme.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Meson+El+Ventorrillo+Churriana+de+la+Vega+restaurante',
          },
          {
            time: '15:30',
            kind: 'showhome',
            title: 'Obra Nueva: Residencial Triana (Las Gabias) y Vial (Churriana)',
            note: 'Visitar exterior de promociones nuevas. Residencial Triana tiene adosados desde 259k. Las promociones en el Vial de Churriana rondan los 329k con piscina privada.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Residencial+Triana+Las+Gabias',
          },
          {
            time: '17:30',
            kind: 'scout',
            title: 'Comprobación de Estación de Metro (Armilla / Fernando de los Ríos)',
            note: 'Inspeccionar la estación de metro con park-and-ride junto al C.C. Nevada. Aquí se aparca gratis para ir al centro en 15 minutos en metro.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Nevada+Shopping+Granada',
          },
          {
            time: '20:30',
            kind: 'dinner',
            title: 'Cena en la Villa o Tapas locales en Granada',
            note: 'Cena tranquila en la casa o tapeo familiar en las plazas de Armilla.',
          },
        ],
      },
      {
        id: 'd3',
        number: 3,
        weekday: 'Viernes',
        date: '14 Ago',
        title: 'Granada → Costa de Málaga (Vélez, Torre del Mar, Rincón) → Sevilla (Bormujos)',
        subtitle: 'Día de traslado: Comparar la costa de Málaga/Axarquía con el Aljarafe sevillano',
        driveKm: 375,
        driveHours: 4.0,
        padel: false,
        sections: [
          {
            time: '08:30',
            kind: 'checkin',
            title: 'Salida del alojamiento de Granada → Viaje a Torre del Mar (1h 15m)',
            note: 'Ruta por la A-44 hacia la costa y luego la A-7 este hasta Torre del Mar (115 km).',
          },
          {
            time: '09:45',
            kind: 'scout',
            title: 'Reconocimiento en Torre del Mar — Paseo Marítimo y Apartamentos',
            note: 'Caminar por el Paseo Marítimo (plano, ideal para pasear). Evaluar los grandes parkings públicos de tierra cerca del faro. Comprobar los bloques de Poniente. Los apartamentos de 3 dormitorios aquí rondan los 240k–320k.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Paseo+Maritimo+Torre+del+Mar+Malaga',
          },
          {
            time: '10:45',
            kind: 'scout',
            title: 'Vélez-Málaga — Inspección de la Expansión de Interior',
            note: 'Conducir 5 min al interior. Evaluar avenidas anchas, pisos modernos (€120k–€180k) y amplios parkings junto al C.C. El Ingenio. Muy transitable fuera del casco histórico.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Centro+Comercial+El+Ingenio+Velez+Malaga',
          },
          {
            time: '11:45',
            kind: 'scout',
            title: 'Reconocimiento: Puerto Deportivo de Caleta de Vélez y Parking',
            note: 'Ambiente de puerto más tranquilo, parking fácil en el puerto y excelentes apartamentos costeros cerca de la autovía.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Puerto+de+Caleta+de+Velez+Malaga',
          },
          {
            time: '12:45',
            kind: 'lunch',
            title: 'Almuerzo: Chiringuito El Playazo (Torre del Mar)',
            note: 'Chiringuito de playa auténtico. Famoso por sus espetos de sardinas frescos, arroces y ambiente familiar sobre la arena. Parking cercano cómodo.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Chiringuito+El+Playazo+Torre+del+Mar+restaurante',
          },
          {
            time: '14:00',
            kind: 'scout',
            title: 'Reconocimiento: Rincón de la Victoria (Añoreta y Paseo)',
            note: 'Conducir 20 min al oeste. Evaluar trazado moderno, parking de fácil acceso y pisos familiares con vistas al mar (€220k–€320k) con garaje en Añoreta/Cotomar.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Rincon+de+la+Victoria+Paseo+Maritimo',
          },
          {
            time: '14:45',
            kind: 'drive',
            title: 'Rincón de la Victoria → Bormujos (Sevilla) por A-7 / A-92',
            note: 'Viaje por el interior por la A-7 y la A-92 (225 km / 2h 30m). Sevilla estará calurosa por la tarde — asegurar aire acondicionado a tope.',
          },
          {
            time: '17:15',
            kind: 'checkin',
            title: 'Registro en el alojamiento: Villa base en Bormujos (Sevilla Aljarafe)',
            note: 'Alojamiento para la última noche. Aparcar y comprobar que el aire enfría bien. Piscina disponible para refrescarse.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Bormujos+Sevilla+Spain+accommodation',
          },
          {
            time: '17:50',
            kind: 'scout',
            title: 'Reconocimiento en Bormujos — Paseo por el Aljarafe y Aparcamiento',
            note: 'Avenidas residenciales, parques infantiles y Mercadona Bormujos. Ver apartamentos y adosados cerca de la Av. San Juan de Dios (230k–340k). Comprobar facilidad de parking.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercadona+Avenida+San+Juan+de+Dios+Bormujos',
          },
          {
            time: '20:30',
            kind: 'dinner',
            title: 'Cena: Venta Pazo (afueras de Sanlúcar la Mayor)',
            note: 'A solo 10 minutos de Bormujos. Venta histórica muy familiar con gran jardín, zona de juegos infantil y parking amplio.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Venta+Pazo+Sanlucar+la+Mayor+restaurante',
          },
        ],
      },
      {
        id: 'd4',
        number: 4,
        weekday: 'Sábado',
        date: '15 Ago',
        title: 'Reconocimiento en Sevilla y Vuelta a Madrid',
        subtitle: 'Control de transporte metropolitano, última auditoría urbana y viaje de vuelta',
        driveKm: 540,
        driveHours: 5.0,
        padel: false,
        sections: [
          {
            time: '10:30',
            kind: 'checkin',
            title: 'Salida del alojamiento de Sevilla → Viaje a Mairena del Aljarafe',
            note: 'Cargar todo el equipaje en la Mercedes Clase V.',
          },
          {
            time: '11:00',
            kind: 'scout',
            title: 'Reconocimiento: Park-and-Ride Metro Ciudad Expo (Mairena del Aljarafe)',
            note: 'Inspeccionar el gran parking disuasorio junto a la cabecera de metro. Aquí aparcan los residentes del Aljarafe gratis para ir en metro al centro, evitando el tráfico y los parkings caros de Sevilla.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Ciudad+Expo+Metro+Sevilla',
          },
          {
            time: '12:00',
            kind: 'scout',
            title: 'Reconocimiento Final de Apartamentos — Bormujos / Tomares',
            note: 'Ver bloques modernos en Tomares y Bormujos. Observar que casi todos incluyen garaje en sótano. Valorar la facilidad de conducción.',
          },
          {
            time: '13:30',
            kind: 'lunch',
            title: 'Almuerzo: Venta La Masía (Bollullos de la Mitación)',
            note: 'Restaurante rústico familiar, gran aparcamiento, comida rápida para el niño antes de emprender el viaje largo.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Venta+La+Masia+Bollullos+de+la+Mitacion+restaurante',
          },
          {
            time: '14:30',
            kind: 'drive',
            title: 'Viaje: Sevilla → Madrid por A-4 Norte',
            note: '530 km, ~5 horas. Altas temperaturas por la tarde — vigilar presión de neumáticos y niveles.',
          },
          {
            time: '17:30',
            kind: 'rest',
            title: 'Reposo: Área de Servicio Repsol (Manzanares, Ciudad Real)',
            note: 'A-4 km 173. Baños limpios, zona de juegos para el niño y aparcamiento grande.',
            maps: 'https://www.google.com/maps/search/?api=1&query=Area+de+servicio+Manzanares+A-4+Repsol',
          },
          {
            time: '20:00',
            kind: 'arrival',
            title: 'Llegada a Madrid Atocha → Devolución del coche → Registro en Hotel',
            note: 'Devolver coche de alquiler. Preparar maletas para el vuelo del domingo.',
          },
        ],
      },
    ],
    obraNueva: [
      { name: 'Residencial Triana', developer: 'Gralusa / Promotores Locales', type: 'Casas adosadas de 3-4 dorm. con opción de piscina', units: 35, priceFrom: '€259,000', handover: '2026/2027', area: 'Barrio Alto-Híjar, Las Gabias', day: 2, maps: 'https://www.google.com/maps/search/?api=1&query=Las+Gabias+Granada+new+builds' },
      { name: 'Residencial Hoyo 15', developer: 'Gralusa', type: 'Chalets pareados de alta gama (frente al golf)', units: 20, priceFrom: '€350,000', handover: 'Diciembre 2026', area: 'Granada Club de Golf, Las Gabias', day: 2, maps: 'https://www.google.com/maps/search/?api=1&query=Granada+Club+de+Golf+Las+Gabias' },
      { name: 'Vial de Churriana Townhouses', developer: 'Navygar / Promotores Locales', type: 'Chalets modernos de 3 dorm. con piscina privada', units: 15, priceFrom: '€329,000', handover: 'Junio 2026+', area: 'Vial de Churriana de la Vega', day: 2, maps: 'https://www.google.com/maps/search/?api=1&query=Churriana+de+la+Vega+Granada+new+builds' },
      { name: 'Azure Living', developer: 'Salsa Inmobiliaria', type: 'Apartamentos modernos de 2-3 dorm. (cerca de playa)', units: 48, priceFrom: '€295,575', handover: 'TBC', area: 'Zona Poniente, Torre del Mar', day: 3, maps: 'https://www.google.com/maps/search/?api=1&query=Torre+del+Mar+Azure+Living' },
      { name: 'Horus V', developer: 'Salsa Inmobiliaria', type: 'Apartamentos y áticos de 1-3 dorm.', units: 80, priceFrom: '€378,000 (Áticos)', handover: 'Finales 2026', area: 'Playa de Poniente, Torre del Mar', day: 3, maps: 'https://www.google.com/maps/search/?api=1&query=Horus+V+Torre+del+Mar' },
      { name: 'Alma Bormujos', developer: 'Grupo Q', type: 'Apartamentos de 1-4 dorm. (urbanización cerrada)', units: 62, priceFrom: '€260,000', handover: '2027', area: 'Corredor Suburbano, Bormujos (Sevilla)', day: 4, maps: 'https://www.google.com/maps/search/?api=1&query=Alma+Bormujos+Grupo+Q' },
    ],
    parkingInfo: [
      { town: 'Las Gabias (Granada)', parkingScore: '⭐⭐⭐⭐⭐ Excelente', difficulty: 'Muy baja', note: 'Las nuevas zonas de expansión (Golf e Híjar) tienen amplias avenidas de 10-12 metros con mucho aparcamiento libre. Casi el 100% de los apartamentos post-2005 incluyen plaza de garaje subterráneo.' },
      { town: 'Alhendín (Granada)', parkingScore: '⭐⭐⭐⭐⭐ Excelente', difficulty: 'Muy baja', note: 'Muy accesible para vehículos con enlace directo a la A-44. Las urbanizaciones de la periferia (Los Llanos) tienen avenidas muy holgadas. Es sencillísimo aparcar dos coches cerca de las viviendas.' },
      { town: 'Churriana de la Vega (Granada)', parkingScore: '⭐⭐⭐⭐ Bueno (Zona Nueva)', difficulty: 'Media-Baja', note: 'El nuevo "Vial" destaca por sus amplios bulevares y aparcamiento en batería/cordón cómodo. No obstante, el casco histórico tiene calles sumamente estrechas que deben evitarse con la furgoneta.' },
      { town: 'Torre del Mar (Málaga)', parkingScore: '⭐⭐⭐ Moderado (Verano)', difficulty: 'Media-Alta', note: 'El área de Poniente tiene avenidas anchas y grandes solares públicos habilitados como parking. Sin embargo, en agosto (temporada alta), aparcar en la calle es difícil. Imprescindible comprar con garaje.' },
      { town: 'Rincón de la Victoria (Málaga)', parkingScore: '⭐⭐⭐⭐ Bueno (Zona Nueva)', difficulty: 'Media', note: 'Las zonas de Añoreta y Cotomar disponen de calzadas holgadas y aparcamiento viable. La primera línea de playa se satura en verano. Recomendado comprar con plaza de garaje.' },
      { town: 'Vélez-Málaga (Málaga)', parkingScore: '⭐⭐⭐⭐ Bueno', difficulty: 'Media-Baja', note: 'Zonas modernas del noroeste y el entorno del C.C. El Ingenio tienen viales muy anchos y grandes bolsas de parking gratis. Evitar el casco antiguo con la furgoneta.' },
      { town: 'Bormujos (Sevilla)', parkingScore: '⭐⭐⭐⭐⭐ Excelente', difficulty: 'Muy baja', note: 'Municipio diseñado para coches. Avenidas espaciosas, grandes zonas de parking libre comercial. El park-and-ride de la estación Ciudad Expo se encuentra al lado y es enorme.' },
    ],
    supermarkets: [
      { name: 'Mercadona Las Gabias', cluster: 'granada', address: 'Calle Real s/n, Las Gabias', note: 'Opción más cercana para Las Gabias; dispone de un amplio parking subterráneo.' },
      { name: 'Lidl Armilla', cluster: 'granada', address: 'Av. Fernando de los Ríos s/n, Armilla', note: 'Los formatos de supermercado más grandes, situados junto al Centro Comercial Nevada.' },
      { name: 'Mercadona Churriana', cluster: 'granada', address: 'Calle Ramon y Cajal, Churriana de la Vega', note: 'Muy accesible y con aparcamiento cómodo para familias.' },
      { name: 'Mercadona Bormujos', cluster: 'sevilla', address: 'Avenida San Juan de Dios s/n, Bormujos', note: 'Excelente ubicación en el Aljarafe con plazas de aparcamiento amplias.' },
      { name: 'Lidl Bormujos', cluster: 'sevilla', address: 'Avenida de la Universidad, Bormujos', note: 'Situado junto al complejo universitario CEU San Pablo.' },
      { name: 'Mercadona Torre del Mar', cluster: 'coast', address: 'Calle Pintor Cipriano Maldonado s/n, Torre del Mar', note: 'Gran Mercadona costero, muy concurrido en pleno verano.' },
    ],
    bases: [
      {
        name: 'Granada Vega (Alhendín / Las Gabias)',
        nights: 'Noches 1 y 2 (Mié 12 + Jue 13 Ago)',
        why: 'Tranquilo, residencial y muy cerca de los 3 municipios de Granada. Ofrece villas con piscina privada a una fracción del coste costero. Aparcamiento seguro para la Clase V.',
        filters: '"Las Gabias" o "Alhendín" + "villa" + "piscina privada" + "aparcamiento"',
        priceBand: '€180–€280/noche (villa de 3-4 dorm. con piscina en agosto — muy competitivo)',
        caution: 'Asegurar aire acondicionado en todas las habitaciones. Las noches de verano en Granada son más frescas por la altitud, pero el aire es necesario.',
      },
      {
        name: 'Sevilla Aljarafe (Bormujos / Tomares)',
        nights: 'Noche 3 (Vie 14 Ago)',
        why: 'Base perfecta para las visitas del Día 4 y salida rápida hacia la A-4 dirección Madrid por la tarde.',
        filters: '"Bormujos" o "Tomares" + "villa" + "piscina" + "aparcamiento"',
        priceBand: '€200–€300/noche (villa de 3-4 dorm. con piscina)',
        caution: 'Las temperaturas de agosto en Sevilla superan a menudo los 40°C. Imprescindible piscina y aire acondicionado 24h para el bienestar del niño.',
      },
    ],
    restaurants: [
      { name: 'Venta El Cordobés', when: 'Día 1 almuerzo (en ruta)', area: 'Bailén / Jaén (A-4 km 295)' },
      { name: 'Restaurante Los Naranjos', when: 'Día 1 cena', area: 'Alhendín, Granada' },
      { name: 'Restaurante Mesón El Ventorrillo', when: 'Día 2 almuerzo', area: 'Churriana de la Vega, Granada' },
      { name: 'Chiringuito El Playazo', when: 'Día 3 almuerzo', area: 'Playa de Torre del Mar, Málaga' },
      { name: 'Venta Pazo', when: 'Día 3 cena', area: 'Sanlúcar la Mayor (cerca de Bormujos), Sevilla' },
      { name: 'Venta La Masía', when: 'Día 4 almuerzo', area: 'Bollullos de la Mitación, Sevilla' },
    ],
    terrenos: {
      rules: [
        'Suelo Urbano: Plenos derechos para edificar. La normativa constructiva es idéntica para construcciones modulares o tradicionales.',
        'Suelo Rústico: Generalmente requiere un mínimo de 25.000 m² para una vivienda unifamiliar en Andalucía. Evitarlo para una edificación ágil.',
        'Los municipios de la Vega de Granada destacan por plazos ágiles de licencias de obra (habitualmente 3-6 meses) frente a la costa (9-18 meses).',
        'Los precios en suelo urbano de Las Gabias o Alhendín rondan los €100–€200/m².',
      ],
      inland: [
        { name: 'Urbanizaciones de Alhendín', municipality: 'Alhendín (Granada)', price: '€120–€180/m²', note: 'La mejor zona para chalets a medida. Terreno llano, calles totalmente asfaltadas y acceso directo a la autovía.' },
        { name: 'Laderas del Golf de Las Gabias', municipality: 'Las Gabias (Granada)', price: '€100–€160/m²', note: 'Suaves pendientes con vistas despejadas a Sierra Nevada y al campo de golf.' },
        { name: 'Churriana de la Vega', municipality: 'Churriana (Granada)', price: '€150–€220/m²', note: 'Suelo urbano muy escaso por la alta densidad y la expansión del metro.' },
        { name: 'Bormujos Aljarafe', municipality: 'Bormujos (Sevilla)', price: '€180–€260/m²', note: 'Mucha demanda de promotores locales. Buenos precios, pero vigilar los coeficientes de ocupación.' },
      ],
      coast: [
        { name: 'Límites de Torre del Mar', municipality: 'Vélez-Málaga', price: '€200–€300/m²', note: 'Pocas parcelas urbanas cerca de la playa. La mayoría se sitúan a 3-5 km hacia el interior.' },
      ],
      western: [],
    },
    resaleClusters: [
      {
        cluster: 'Granada Vega (Objetivo Principal)',
        subtitle: 'Valor excepcional para jubilación familiar (bajo 380k)',
        entries: [
          { urbanization: 'Las Gabias (Híjar / Golf)', type: 'Apartamento de 3 dorm. moderno / Golf', price: '€110,000–€170,000' },
          { urbanization: 'Churriana de la Vega (Vial Nuevo)', type: 'Apartamento moderno de 3 dorm. con Garaje', price: '€120,000–€180,000' },
          { urbanization: 'Alhendín (La Masía / Los Llanos)', type: 'Ático de 3 dorm. con terraza grande', price: '€130,000–€195,000' },
          { urbanization: 'Armilla (límite Metro)', type: 'Apartamento de 3 dorm. junto a estación de Metro', price: '€140,000–€210,000' },
        ],
      },
      {
        cluster: 'Costa de Málaga Oriental',
        subtitle: 'Entorno de playa llano y accesible',
        entries: [
          { urbanization: 'Torre del Mar (Playa Poniente)', type: 'Apartamento moderno de 3 dorm. junto al Paseo', price: '€240,000–€320,000' },
          { urbanization: 'Rincón de la Victoria (Añoreta)', type: 'Piso de 3 dorm. con vistas al mar y piscina', price: '€220,000–€310,000' },
          { urbanization: 'Vélez-Málaga (Zona El Ingenio)', type: 'Piso moderno de 3 dorm. con garaje', price: '€120,000–€180,000' },
          { urbanization: 'Torre del Mar (Periferia)', type: 'Chalet pareado de 3 dorm.', price: '€300,000–€380,000' },
          { urbanization: 'Caleta de Vélez (Golf)', type: 'Adosado de 3 dorm. cerca del Puerto y Golf', price: '€280,000–€360,000' },
        ],
      },
      {
        cluster: 'Sevilla Aljarafe',
        subtitle: 'Suburbios residenciales familiares de primer nivel',
        entries: [
          { urbanization: 'Bormujos (Av. Universidad)', type: 'Apartamento de 3 dorm. con garaje', price: '€150,000–€220,000' },
          { urbanization: 'Tomares (límite Bormujos)', type: 'Piso moderno de 3 dorm. en urbanización cerrada', price: '€190,000–€270,000' },
          { urbanization: 'Bollullos de la Mitación', type: 'Chalet de 4 dorm. en urbanización residencial', price: '€230,000–€340,000' },
        ],
      },
    ],
    questions: {
      obraNueva: [
        '¿El precio incluye el 10% de IVA, gastos de registro y de notaría (calcular un 11-12% de gastos extra)?',
        '¿La plaza de garaje y trastero están incluidos en el precio anunciado (clave en Torre del Mar y Bormujos)?',
        '¿Cuál es el aval bancario específico que ofrece la promotora en caso de retraso en la construcción?',
        '¿Cuáles son los gastos de comunidad mensuales previstos para piscina y zonas comunes?',
      ],
      terreno: [
        '¿La parcela está clasificada como Suelo Urbano Consolidado (permits immediate build)?',
        '¿Están las acometidas de servicios (luz, agua, alcantarillado) pagadas a pie de parcela?',
        '¿Existe alguna protección ecológica (encinas) o arqueológica que limite el plano constructivo?',
        'Para viviendas modulares, ¿admite el ayuntamiento la Declaración Responsable para agilizar la obra?',
      ],
      resale: [
        '¿Están los metros reales de la casa y de la piscina inscritos correctamente en el Registro y Catastro?',
        '¿De qué año data la última reforma de fontanería, electricidad, tejado y climatización?',
        '¿A cuánto ascienden el IBI anual y las cuotas ordinarias de la comunidad?',
        '¿Dispone la propiedad de la Cédula de Habitabilidad o Licencia de Primera Ocupación al día?',
      ],
    },
    caveats: [
      'Cierres de agosto en Andalucía — es imprescindible confirmar por teléfono con 48h de antelación con inmobiliarias y restaurantes, ya que muchos cierran por vacaciones.',
      'Calor extremo en Sevilla — las temperaturas en Sevilla y Bormujos en agosto rondan los 42°C. Asegurar que los alojamientos y el coche tengan aire acondicionado excelente.',
      'Asesoramiento legal y fiscal — al comprar una vivienda en España, contrate a un abogado local independiente para verificar el estado de cargas de la finca. Prever un 1% del precio de compra para honorarios.',
    ],
  },
}
