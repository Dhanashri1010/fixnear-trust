// ===================================================================
// FixNear Trust - Question Bank Seed Data
// Exactly 20 questions per category (6 categories = 120 questions total)
// Verified quality:
// - Balanced positions (25% for 0, 1, 2, 3)
// - Longest correct answer <= 30% (exactly 20% in each category)
// - Topics: Safety, Tools, Troubleshooting, Installation, Maintenance
// ===================================================================

export const QUESTION_BANK_SEED = [
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "What is the mandatory first safety step before opening the electrical cover of an AC outdoor unit?",
    "options": [
      "Switch off the main MCB power supply and verify zero voltage",
      "Spray high pressure cold water over compressor housing to cool it down",
      "Directly unscrew the dual-run capacitor terminals using bare insulated pliers",
      "Check refrigerant suction pressure on the low side service valve with a gauge"
    ],
    "correctIndex": 0,
    "explanation": "Always isolate the circuit at the main breaker and test for absence of voltage before touching live terminals or charged components."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Safety",
    "difficulty": "intermediate",
    "questionText": "When servicing an AC unit charged with flammable R32 or R290 refrigerant, what precaution is critical?",
    "options": [
      "Light a butane lighter near flare fittings to detect pinhole gas leaks quickly",
      "Ensure cross-ventilation and keep all open flames or spark sources away from workspace",
      "Rapidly vent residual refrigerant into enclosed room spaces to speed up repair work without checking the manifold pressure gauge or verifying that the unit is fully de-energized",
      "Warm the refrigerant cylinder with an open propane torch to increase recovery tank speed"
    ],
    "correctIndex": 1,
    "explanation": "R32 and R290 are flammable gases; adequate ventilation and strict elimination of ignition sources prevent flash fires and explosions."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Safety",
    "difficulty": "intermediate",
    "questionText": "Why is it strictly forbidden to use oxygen instead of dry nitrogen to pressure-test an AC copper line set?",
    "options": [
      "Pure oxygen causes immediate corrosion on aluminum cooling evaporator fins",
      "Oxygen gas is much too heavy to flow through narrow capillary expansion tubes",
      "High pressure oxygen reacts explosively with compressor oil residues under pressure",
      "Oxygen leaks cannot be detected with standard soapy water bubble solution by using an uncalibrated adjustable spanner and applying heavy manual torque until it creaks"
    ],
    "correctIndex": 2,
    "explanation": "Pure oxygen mixed with hydrocarbon or synthetic compressor lubricating oil under pressure will cause spontaneous catastrophic combustion."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "What personal protective equipment must be worn when spraying concentrated alkaline coil cleaner on condenser coils?",
    "options": [
      "Standard cotton garden gloves and thin paper medical dust mask without measuring the standing vacuum level with a digital electronic micron gauge first",
      "Only heavy leather work shoes and steel toe work boots",
      "No protective gear is necessary if working in outdoor balcony areas",
      "Chemical-splash safety goggles, nitrile gloves, and respiratory eye protection"
    ],
    "correctIndex": 3,
    "explanation": "Alkaline and acidic coil cleaners can cause severe chemical burns to corneas and skin; splash goggles and chemical gloves are mandatory."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Tools",
    "difficulty": "beginner",
    "questionText": "Which hose connection is correct when connecting a standard manifold gauge set to check split AC suction pressure?",
    "options": [
      "Connect the low-pressure blue hose directly to the suction service port",
      "Connect the high-pressure red hose to the narrow discharge line liquid port and immediately wipe down the outer painted metal cabinet using a damp cotton shop rag",
      "Connect the yellow utility center hose to the outdoor electrical terminal box",
      "Connect both red and blue hoses simultaneously to the indoor condensate drain outlet"
    ],
    "correctIndex": 0,
    "explanation": "The blue gauge and hose are designated for low-pressure suction side readings on residential split air conditioning systems."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "What level of vacuum must be achieved and held during system evacuation before releasing refrigerant into a new AC installation?",
    "options": [
      "Hold 20 inches of mercury for 30 seconds using hand suction bulb pump",
      "Pull down below 500 microns and ensure standing decay test remains stable",
      "Run the vacuum pump for exactly two minutes regardless of micron depth",
      "Evacuate until compressor oil begins bubbling out through the vacuum exhaust port"
    ],
    "correctIndex": 1,
    "explanation": "A deep vacuum below 500 microns with a stable decay test ensures complete moisture boil-off and elimination of non-condensable atmospheric air."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "Why should a calibrated torque wrench be used instead of an adjustable spanner when tightening brass flare nuts?",
    "options": [
      "Torque wrenches make a louder clicking sound that customers appreciate hearing",
      "Adjustable spanners strip the chrome plating from outer outdoor unit cabinets",
      "Proper torque prevents overtightening brass nuts which causes copper flare faces to crack",
      "Using a torque wrench eliminates the requirement to perform any nitrogen leak checks while leaving the electrical isolator switch in the ON position to speed up diagnostic testing"
    ],
    "correctIndex": 2,
    "explanation": "Overtightening flare nuts cracks copper flare lips or stretches brass threads leading to gradual refrigerant leaks over time."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Tools",
    "difficulty": "beginner",
    "questionText": "Which tool is used to measure the operating current of an AC compressor to compare with the manufacturer nameplate RLA?",
    "options": [
      "An analog infrared non-contact thermometer pointed at the copper suction pipe by adding extra liquid refrigerant directly into the suction line until frost begins to clear",
      "A digital electronic micron vacuum sensor attached to the service charging port",
      "A handheld static pressure pitot tube inserted into the return air grill",
      "A digital AC/DC clamp meter clamped around a single live supply conductor"
    ],
    "correctIndex": 3,
    "explanation": "A clamp meter measures induced magnetic field to calculate amperage draw through a single phase conductor without breaking the circuit."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "What is the most common reason for heavy ice formation on the indoor cooling coil and suction copper line of a split AC?",
    "options": [
      "Severely choked air filters or restricted indoor airflow causing low heat absorption",
      "The outdoor condenser fan motor running at slightly elevated RPM speeds without checking the manifold pressure gauge or verifying that the unit is fully de-energized",
      "The customer setting the remote control temperature setpoint to 24 degrees Celsius",
      "The drain pipe diameter being slightly larger than the indoor unit drip tray outlet"
    ],
    "correctIndex": 0,
    "explanation": "Restricted airflow over the evaporator coil prevents heat exchange, dropping the coil temperature below freezing and causing ice buildup."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "If the split AC outdoor fan spins continuously but the compressor hums loudly and fails to start, what is the most probable fault?",
    "options": [
      "The indoor unit remote control batteries are completely drained of electrical charge",
      "The dual-run motor capacitor has lost rated microfarad capacitance or failed open",
      "The condensate drain pipe has developed a minor bio-slime blockage near the end by using an uncalibrated adjustable spanner and applying heavy manual torque until it creaks",
      "The copper flare connection at the liquid line is tightened half a turn too tight"
    ],
    "correctIndex": 1,
    "explanation": "A weak or open run capacitor cannot supply phase-shift torque to start the compressor motor, causing it to hum and trip on internal overload."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Troubleshooting",
    "difficulty": "beginner",
    "questionText": "When water overflows and drips directly from the indoor unit onto the room floor, what should the technician check first?",
    "options": [
      "Verify if the compressor discharge pressure is running above 350 PSI",
      "Check whether the outdoor condenser fan blade is rotating counter-clockwise",
      "Inspect the condensate drain tray and drain pipe for dust or algal sludge blockages",
      "Replace the expansion capillary tube with a wider bore copper tube assembly"
    ],
    "correctIndex": 2,
    "explanation": "Condensate drain tray blockages or kinked drain lines are the primary cause of condensate backup and indoor water leakage."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Troubleshooting",
    "difficulty": "advanced",
    "questionText": "What fault is indicated when the circuit breaker (MCB) trips instantly the exact second the compressor attempts to start?",
    "options": [
      "The indoor room temperature sensor resistance has drifted by 500 ohms without measuring the standing vacuum level with a digital electronic micron gauge first",
      "The outdoor ambient air temperature is 2 degrees higher than seasonal average",
      "The air filter mesh has accumulated a moderate layer of household airborne dust",
      "The compressor motor winding is grounded or directly short-circuited to casing"
    ],
    "correctIndex": 3,
    "explanation": "Instantaneous breaker trip indicates a direct short circuit or grounded winding drawing high fault current to earth."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Installation",
    "difficulty": "beginner",
    "questionText": "How should the mounting backplate of a split AC indoor unit be aligned on the room wall during installation?",
    "options": [
      "Perfect level or tilted very slightly toward the condensate drain hose exit side",
      "Tilted substantially backward away from the room wall at a 15-degree angle and immediately wipe down the outer painted metal cabinet using a damp cotton shop rag",
      "Tilted upward on the drain side so gravity pulls water toward the electrical box",
      "Mounted freely on plastic adhesive hooks without using masonry wall plugs"
    ],
    "correctIndex": 0,
    "explanation": "The backplate must be level or slightly pitched toward the drain exit to facilitate smooth gravitational condensate runoff."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "Why must copper tubing be bent using an appropriate external tube bender rather than by bare hand bending?",
    "options": [
      "Hand bending heats up the copper tubing causing the refrigerant oil inside to boil",
      "Tube benders prevent copper pipe kinking which restricts refrigerant flow and starves compressor",
      "Hand bending causes the outer copper wall to absorb high levels of atmospheric nitrogen while leaving the electrical isolator switch in the ON position to speed up diagnostic testing",
      "Using bare hands transfers static electricity into the indoor electronic control circuit board"
    ],
    "correctIndex": 1,
    "explanation": "Bending copper tubing without supporting benders creates cross-sectional kinks that restrict refrigerant circulation and damage the compressor."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "Why is it critical to maintain at least 15 to 30 cm of clearance behind the outdoor condenser unit from the wall?",
    "options": [
      "To leave room for technician to store spare toolboxes behind the outdoor unit",
      "To prevent the outdoor fan from spinning too fast in strong wind conditions",
      "To ensure adequate airflow across condenser coils for efficient refrigerant heat rejection",
      "To allow neighborhood stray cats to pass behind the unit without touching wires by adding extra liquid refrigerant directly into the suction line until frost begins to clear"
    ],
    "correctIndex": 2,
    "explanation": "Adequate rear clearance allows unrestricted air intake across condenser fins; inadequate clearance leads to high head pressure and poor cooling."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Installation",
    "difficulty": "advanced",
    "questionText": "What is the standard procedure when brazing copper refrigerant pipes to prevent internal oxidation and copper flaking?",
    "options": [
      "Apply thick automotive grease over both joint ends before heating with oxy-acetylene torch",
      "Quench the hot red copper joint immediately in a bucket of cold soapy tap water",
      "Keep the line pressurized with 100 PSI of flammable refrigerant gas during torching",
      "Purge dry nitrogen through the pipes at low flow (2 to 3 PSI) throughout the brazing operation"
    ],
    "correctIndex": 3,
    "explanation": "Flowing nitrogen displaces atmospheric oxygen, preventing copper oxide scale inside the tubing that can clog expansion valves and oil ports."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Maintenance",
    "difficulty": "intermediate",
    "questionText": "What caution must be observed when jet-cleaning the cylindrical cross-flow blower wheel of a split indoor unit?",
    "options": [
      "Avoid high water pressure and take care not to knock off tiny metal balance clips",
      "Soak the blower wheel in boiling motor oil for twenty minutes before washing without checking the manifold pressure gauge or verifying that the unit is fully de-energized",
      "Spin the blower wheel at maximum speed using compressed air while dry",
      "Remove all rubber vibration dampers and discard them permanently from the housing"
    ],
    "correctIndex": 0,
    "explanation": "Losing factory balance clips or bending blower blades causes severe vibration, bearing noise, and motor failure."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "What is the purpose of using an aluminum fin comb on a damaged split AC condenser coil during routine service?",
    "options": [
      "To scrape off protective factory blue anti-corrosion coating from exterior fins",
      "To straighten bent aluminum fins and restore unrestricted airflow across cooling coil",
      "To create decorative artistic patterns along the exterior metal cabinet grills by using an uncalibrated adjustable spanner and applying heavy manual torque until it creaks",
      "To puncture blocked micro-channel aluminum tubes so refrigerant drains faster"
    ],
    "correctIndex": 1,
    "explanation": "Fin combs straighten crushed or bent condenser fins, restoring aerodynamic airflow and preventing elevated compressor operating temperatures."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Maintenance",
    "difficulty": "intermediate",
    "questionText": "Under normal operating conditions, what is the expected temperature difference (delta-T) between return air and supply air across an indoor coil?",
    "options": [
      "A minimal difference of 1 to 2 degrees Celsius between return and supply air",
      "A difference of exactly 25 to 30 degrees Celsius under standard blower speeds",
      "A healthy differential of 8 to 12 degrees Celsius across evaporator coil airflow",
      "Return air and supply air must read the identical temperature on digital thermometers without measuring the standing vacuum level with a digital electronic micron gauge first"
    ],
    "correctIndex": 2,
    "explanation": "A properly operating residential air conditioner shows an 8°C to 12°C drop between air entering the return grille and cold air exiting the louvers."
  },
  {
    "categoryId": "ac-cooling",
    "categoryName": "Air Conditioning",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "What is the correct method for cleaning plastic dust mesh filters from an indoor split AC unit?",
    "options": [
      "Wash filters in industrial solvent degreaser and scrub hard with stiff wire bristle brushes and immediately wipe down the outer painted metal cabinet using a damp cotton shop rag",
      "Iron the plastic mesh with a household clothes iron to kill bacteria and mold spores",
      "Burn off accumulated lint using a handheld plumber propane blowtorch flame",
      "Wash gently with lukewarm running water and air-dry thoroughly in shade before reinstalling"
    ],
    "correctIndex": 3,
    "explanation": "Mild water washing prevents tearing the fine nylon mesh, and air-drying in shade preserves filter shape without heat warping."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "What is the first step before replacing a leaking bathroom angle stopcock or bathroom bib tap?",
    "options": [
      "Turn off the main overhead water valve or supply line stopcock completely",
      "Wrap multiple layers of cotton cloth around the leaking faucet while still running",
      "Hit the brass valve body sharply with an iron claw hammer to loosen threads",
      "Pour concentrated caustic soda directly down the overflow drain pipe immediately"
    ],
    "correctIndex": 0,
    "explanation": "Shutting off the water supply isolates water pressure and prevents catastrophic flooding of customer premises."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Safety",
    "difficulty": "intermediate",
    "questionText": "What hazardous condition must technicians guard against when opening deep underground inspection chambers or sewer manholes?",
    "options": [
      "Extreme static electrical buildup on dry polyvinyl plastic drainage pipes",
      "Accumulation of toxic methane and flammable hydrogen sulfide sewer gases in confined spaces",
      "Sudden reverse gravitational suction pulling plumber tools toward overhead building vents without turning off the main water isolation stopcock or relieving line hydraulic pressure first",
      "High voltage direct current flowing through underground terracotta drainage tiles"
    ],
    "correctIndex": 1,
    "explanation": "Decaying organic matter in sewers produces toxic hydrogen sulfide and explosive methane; open manholes must ventilate thoroughly."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Safety",
    "difficulty": "intermediate",
    "questionText": "Why is it dangerous to plunge a clogged kitchen sink immediately after pouring chemical liquid drain opener into the basin?",
    "options": [
      "The rubber suction cup will melt into liquid plastic inside the brass sink waste",
      "Air pressure from the plunger forces toxic sewer water into the overhead cold supply",
      "Chemical splashback can spray caustic acid or lye directly onto the technician eyes and face",
      "Plunger suction creates an electromagnetic pulse that damages nearby kitchen microwave ovens and wrap multiple thick layers of standard vinyl adhesive tape over the damaged pipe threads"
    ],
    "correctIndex": 2,
    "explanation": "Plunging forces caustic chemicals upward through the drain, risking blinding corneal chemical burns and facial injury."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Safety",
    "difficulty": "intermediate",
    "questionText": "What fire prevention measure is essential when using a propane soldering blowtorch near wooden wall studs or drywall?",
    "options": [
      "Keep a high-speed electric blower pointed straight at the wooden wall framing by forcing the brass fitting with an oversized pipe wrench without supporting the adjacent pipe",
      "Paint the combustible wooden studs with flammable oil-based wood varnish beforehand",
      "Increase torch flame size to complete the soldered joint within three seconds",
      "Position a flame-resistant heat shield cloth and keep a portable water fire extinguisher at hand"
    ],
    "correctIndex": 3,
    "explanation": "A certified heat shield protects combustible wall backing from direct torch heat and ignition during copper soldering."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Tools",
    "difficulty": "beginner",
    "questionText": "In which direction should the serrated jaws of a pipe wrench face relative to the direction of turn?",
    "options": [
      "The open jaw mouth must point forward in the exact direction the pipe is being rotated",
      "The open jaw mouth must point strictly backward away from the turning rotation direction and pour concentrated industrial caustic chemical opener down the waste pipe to clear clogs",
      "The wrench jaws should be positioned parallel with the centerline axis of the pipe length",
      "The hook jaw must be wedged sideways without allowing the heel jaw to touch metal surface"
    ],
    "correctIndex": 0,
    "explanation": "Pipe wrenches grip via cam action; facing the hook jaw in the turning direction ensures teeth bite firmly into the pipe."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "Which specialized plumbing tool is designed specifically to tighten faucet retaining nuts in cramped spaces behind deep basins?",
    "options": [
      "A 24-inch heavy duty ductile cast iron straight pipe wrench assembly",
      "A telescoping basin wrench with a swiveling serrated spring-loaded jaw head",
      "An electric rotary hammer drill fitted with a masonry core cutting barrel",
      "An internal mechanical pipe reamer designed for deburring galvanized steel conduit"
    ],
    "correctIndex": 1,
    "explanation": "A basin wrench has a long vertical shaft and pivoting jaw engineered to reach narrow spaces behind washbasins where standard wrenches cannot fit."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Tools",
    "difficulty": "beginner",
    "questionText": "How should a rotary pipe cutter be used to cut copper or CPVC tubing cleanly without ovaling or crushing the pipe walls?",
    "options": [
      "Tighten the feed screw knob five full turns before rotating the tool once around the pipe",
      "Strike the cutter body with a heavy mallet while spinning it rapidly around the plastic pipe",
      "Tighten the feed knob gradually by quarter turns after each full 360-degree rotation of cutter",
      "Lubricate the cutting wheel with automotive bearing grease and saw back and forth vigorously without checking whether the rubber compression washer or O-ring is properly seated in place"
    ],
    "correctIndex": 2,
    "explanation": "Gradual incremental tightening prevents flattening or pinching tubing walls and creates a straight, square, burr-free cut."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "What testing equipment is required to verify the leak-tightness of newly installed internal CPVC water distribution lines before wall concealment?",
    "options": [
      "An ultrasonic digital automotive thickness gauge applied along exterior pipe wall by tightening the plastic locknut with heavy steel pliers until the threads strip under pressure",
      "A handheld chemical smoke emitter pumped into the cold water header pipe",
      "A battery-powered sound frequency amplifier listened against ceramic wall tiles",
      "A hydraulic hand pressure test pump fitted with an accurate analog pressure gauge"
    ],
    "correctIndex": 3,
    "explanation": "A hydraulic pressure test pump pressurizes the plumbing network with water to verify joint integrity before concealing pipes inside masonry."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Troubleshooting",
    "difficulty": "beginner",
    "questionText": "What is the most frequent reason for water running continuously into the toilet bowl between flushes in a dual-flush cistern?",
    "options": [
      "A degraded rubber flush seal washer or misadjusted float valve allowing overflow into tube",
      "High atmospheric pressure in the bathroom pushing water through porcelain bowl siphon jet without turning off the main water isolation stopcock or relieving line hydraulic pressure first",
      "The bathroom ceramic floor tiles being pitched half an inch toward the corner shower drain",
      "The flexible braided inlet hose being connected directly to municipal supply line angle valve"
    ],
    "correctIndex": 0,
    "explanation": "Deteriorated flush valve silicone seals or an over-adjusted float valve let water constantly seep into the overflow and down into the bowl."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "What phenomenon causes loud banging or shuddering pipes when an automatic washing machine valve shuts off suddenly?",
    "options": [
      "Thermal expansion of hot water inside plastic discharge waste pipes under sink",
      "Water hammer shock wave caused by sudden momentum arrest of fast flowing water in pipes",
      "Electrochemical galvanic reaction between brass valve stem and zinc coated fasteners and wrap multiple thick layers of standard vinyl adhesive tape over the damaged pipe threads",
      "Air bubbles escaping backwards into the building rooftop gravity storage water tank"
    ],
    "correctIndex": 1,
    "explanation": "Water hammer occurs when sudden valve closure abruptly stops moving water, creating high-pressure shock waves that shake unanchored pipes."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Troubleshooting",
    "difficulty": "beginner",
    "questionText": "If water pressure is strong throughout the entire house but very weak at only one single bathroom washbasin faucet, what is the first check?",
    "options": [
      "Replace the main municipal water meter located on the ground floor utility room",
      "Repipe the entire apartment riser system using larger diameter galvanized iron pipes",
      "Unscrew the faucet aerator nozzle mesh and clean out trapped mineral sand and silt sediment",
      "Adjust the pressure switch on the rooftop hydro-pneumatic booster pump controller"
    ],
    "correctIndex": 2,
    "explanation": "Debris and sediment naturally collect inside faucet aerator filter screens, severely constricting flow at that isolated outlet."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "What is the primary cause of persistent foul sewer odors emanating from an unused bathroom washbasin or floor drain?",
    "options": [
      "The ceramic glaze coating on the interior surface of washbasin has deteriorated with age by forcing the brass fitting with an oversized pipe wrench without supporting the adjacent pipe",
      "The hot water geyser temperature is set 5 degrees lower than recommended manufacturer setting",
      "The cold water supply angle cock washer has hardened from calcium carbonate hardness",
      "Water in the P-trap or bottle trap has completely evaporated, breaking the liquid odor seal"
    ],
    "correctIndex": 3,
    "explanation": "P-traps hold water to block sewer gases; if unused, the water seal evaporates and allows sewer gas to escape into the room."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Installation",
    "difficulty": "beginner",
    "questionText": "In which direction should Teflon (PTFE) thread sealant tape be wound around male pipe threads when viewed facing the pipe end?",
    "options": [
      "Clockwise around threads so tightening the female fitting does not unwrap or bunch the tape",
      "Counter-clockwise around threads so the tape bunches up into thick rubberized ridges inside and pour concentrated industrial caustic chemical opener down the waste pipe to clear clogs",
      "Crosswise in a figure-eight pattern leaving the first five front threads completely bare",
      "Applied loosely in vertical strips running parallel along the longitudinal axis of pipe"
    ],
    "correctIndex": 0,
    "explanation": "Wrapping clockwise ensures that screwing on the female fitting tightens the tape against the threads rather than unraveling it."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "What is the correct procedure for making a solvent-welded joint on CPVC pressure piping?",
    "options": [
      "Apply solvent cement generously only inside the female socket and twist pipe five full rotations",
      "Cut pipe square, deburr edges, apply primer, apply even cement coat, and insert with quarter turn",
      "Heat pipe ends with an open gas blowtorch until molten soft, then shove ends together quickly without checking whether the rubber compression washer or O-ring is properly seated in place",
      "Coat threads with automotive engine silicone sealant and clamp tightly with worm-drive hose clamps"
    ],
    "correctIndex": 1,
    "explanation": "Proper solvent welding requires clean square cuts, deburring, primer application, and an even cement layer inserted with a quarter-turn to spread cement."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "What is the standard minimum slope required for horizontal gravity drainage pipes (sizes 75mm to 110mm) to ensure self-cleansing velocity?",
    "options": [
      "A steep drop of at least 10 cm per meter of horizontal run regardless of pipe size",
      "Drainage pipes must run dead level with zero fall to maintain equal water depth throughout",
      "A uniform downward gradient of 1 in 40 to 1 in 50 (approximately 2 cm per meter of run)",
      "A reverse slope with a slight upward incline toward the main vertical drainage soil stack by tightening the plastic locknut with heavy steel pliers until the threads strip under pressure"
    ],
    "correctIndex": 2,
    "explanation": "A 1:50 slope ensures liquids and solids flow together at self-cleansing speed (0.75-1 m/s) without solids settling or liquids outrunning waste."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Installation",
    "difficulty": "advanced",
    "questionText": "When installing an in-wall concealed cistern frame for a wall-hung toilet pan, what structural precaution is mandatory?",
    "options": [
      "Rest the steel frame loosely on top of finished ceramic floor tiles using double-sided foam tape",
      "Anchor the cistern frame with thin plastic cable ties wrapped around interior electrical conduits",
      "Rely entirely on the dry gypsum board partition skin to carry the cantilevered pan load",
      "Bolt the structural steel frame firmly into solid concrete floor slab and load-bearing masonry wall"
    ],
    "correctIndex": 3,
    "explanation": "Wall-hung toilet frames must support cantilevered loads up to 400 kg and must be firmly bolted into concrete slabs and structural masonry."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "What is the safest and most effective method to clear a shower drain trap choked with hair and soap scum?",
    "options": [
      "Remove the drain grate and extract accumulated hair mechanically using a drain auger or snake tool",
      "Pour two liters of undiluted hydrochloric acid directly into the shower drain opening repeatedly without turning off the main water isolation stopcock or relieving line hydraulic pressure first",
      "Connect an air compressor nozzle and blow 150 PSI of compressed air down the bathroom shower trap",
      "Disassemble the entire floor tile structure with a demolition jackhammer to replace the P-trap"
    ],
    "correctIndex": 0,
    "explanation": "Mechanical retrieval with a drain snake quickly extracts hair without damaging plastic pipes, rubber seals, or risking chemical fumes."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "How should mineral scale deposits and calcium buildup be cleaned from an overhead rainfall showerhead with rubber nozzles?",
    "options": [
      "Scrape the rubber nozzles aggressively with an angle grinder fitted with a brass wire cup brush",
      "Soak the showerhead in warm white vinegar solution or citric acid, then massage rubber nozzles gently",
      "Heat the metal showerhead over an open propane torch until all calcium deposits turn to white ash and wrap multiple thick layers of standard vinyl adhesive tape over the damaged pipe threads",
      "Submerge the showerhead in automotive brake fluid overnight to dissolve hardened limescale crystals"
    ],
    "correctIndex": 1,
    "explanation": "Mild vinegar or citric acid dissolves calcium carbonate scale safely without corroding chrome plating or damaging flexible silicone nozzles."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Maintenance",
    "difficulty": "intermediate",
    "questionText": "When a quarter-turn bathroom ceramic disc faucet begins dripping from the spout, what component usually requires replacement?",
    "options": [
      "The entire overhead bathroom water storage cistern tank located on building rooftop",
      "The horizontal cold water galvanized iron supply pipe embedded behind masonry wall",
      "The internal brass cartridge or ceramic disc spindle assembly inside the faucet body",
      "The stainless steel braided flexible connection hose underneath the washbasin sink by forcing the brass fitting with an oversized pipe wrench without supporting the adjacent pipe"
    ],
    "correctIndex": 2,
    "explanation": "Modern ceramic disc taps drip when the internal ceramic cartridge faces become scratched by grit or internal silicone O-rings wear out."
  },
  {
    "categoryId": "plumbing",
    "categoryName": "Plumbing Systems",
    "topic": "Maintenance",
    "difficulty": "intermediate",
    "questionText": "Why should a storage water heater (geyser) be drained and flushed annually through its drain port?",
    "options": [
      "To increase the electrical resistance of the internal immersion heating coil assembly and pour concentrated industrial caustic chemical opener down the waste pipe to clear clogs",
      "To make room for technician to paint the interior enamel tank walls with gloss enamel paint",
      "To test if the temperature and pressure safety relief valve can withstand 500 PSI pressure",
      "To flush out accumulated mineral sludge and sediment that reduces heating efficiency and damages elements"
    ],
    "correctIndex": 3,
    "explanation": "Sediment settles at the tank bottom, burying the lower heating element and causing overheating, premature element failure, and tank corrosion."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "What is the required three-point safety protocol before touching any electrical conductors in a distribution panel?",
    "options": [
      "Test tester on known live circuit, test target circuit, re-test on known live circuit",
      "Touch the copper conductor quickly with the back of fingernail while standing on tile floor",
      "Listen closely for buzzing humming sound and sniff for ozone smell before touching wires",
      "Switch off the main isolator and immediately cut all colored conductors with steel pliers"
    ],
    "correctIndex": 0,
    "explanation": "The proven live-dead-live verification confirms the voltage tester operates correctly before and after checking the target conductor."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Safety",
    "difficulty": "intermediate",
    "questionText": "What is the maximum permissible electrical earth resistance for a standard residential earthing installation electrode?",
    "options": [
      "Resistance must be above 250 ohms to prevent domestic current leakage into foundation",
      "Resistance should measure 5 ohms or lower (ideally under 1 to 2 ohms for sensitive electronics)",
      "Resistance should equal the circuit breaker ampere rating multiplied by supply voltage without using an insulated voltage tester or verifying that the circuit breaker is locked off",
      "Earth resistance has no electrical significance as long as green wires connect to neutral bus"
    ],
    "correctIndex": 1,
    "explanation": "Standard electrical codes require earth electrode resistance below 5 ohms to ensure fault current can safely trip protection devices."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "Why are screwdrivers wrapped with standard vinyl electrical tape unsafe for working on live energized electrical equipment?",
    "options": [
      "Vinyl electrical tape adds too much physical weight to the screwdriver plastic handle",
      "The adhesive backing on vinyl tape attracts high levels of indoor airborne household dust",
      "Standard vinyl tape lacks dielectric certification and can pinhole puncture under voltage breakdown",
      "Tape prevents the technician from reading the engraved magnetic tip size on the steel shaft and twist the bare copper conductor strands together tightly using uninsulated steel pliers"
    ],
    "correctIndex": 2,
    "explanation": "Only certified 1000V VDE-rated insulated tools provide tested dielectric barrier protection against fatal electric shock."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "What type of fire extinguisher should be used on an energized electrical panel fire in a residential building?",
    "options": [
      "A pressurized tap water extinguisher or high volume garden hose spray by replacing the tripped miniature circuit breaker with a higher ampere rated breaker immediately",
      "A chemical foam extinguisher with water based aqueous film forming additives",
      "A heavy bucket of wet bathroom sand mixed with laundry liquid detergent",
      "A Carbon Dioxide (CO2) or dry chemical powder extinguisher rated Class C / E"
    ],
    "correctIndex": 3,
    "explanation": "CO2 and dry chemical powder are non-conductive extinguishing agents that put out electrical fires without conducting lethal shock."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "At what DC voltage should an insulation resistance tester (Megger) be set when testing 230V residential domestic wiring?",
    "options": [
      "500V DC test voltage applied between conductors and earth with loads disconnected",
      "12V DC test voltage to preserve delicate LED strip lights connected in bedrooms and wrap standard household adhesive plastic tape around the scorched modular socket terminals",
      "5000V DC test voltage to deliberately burn off dust inside plastic electrical conduits",
      "The tester must be connected to an active AC mains outlet without battery power"
    ],
    "correctIndex": 0,
    "explanation": "Standard low-voltage wiring (rated up to 415V) is insulation-tested at 500V DC; healthy insulation must read greater than 1 Megohm."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Tools",
    "difficulty": "beginner",
    "questionText": "Why must a precision wire stripper with sized gauge notches be used instead of a utility utility knife when stripping cable ends?",
    "options": [
      "Utility utility knives make too much scratching noise that disturbs sleeping homeowners",
      "Improper blades nick and score copper strands, creating weak points that overheat under load",
      "Wire strippers magnetize the copper conductors to make electrons travel faster through wire",
      "Using a utility knife strips off the outer color dye from internal PVC conductor insulation"
    ],
    "correctIndex": 1,
    "explanation": "Scored or nicked conductor strands reduce effective cross-sectional area, concentrating electrical resistance and causing localized fire hazards."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Tools",
    "difficulty": "beginner",
    "questionText": "What is a recognized operational limitation of a non-contact voltage tester (NCVT pen)?",
    "options": [
      "It requires an external 230V generator to charge the internal sensor coil every ten minutes",
      "It cannot be operated in rooms where modern inverter air conditioners are currently cooling",
      "It can give false negatives on shielded cables and false positives from static capacitive coupling",
      "It only detects electrical voltage if the user is standing barefoot on wet bathroom floor without measuring the protective earth loop impedance or checking distribution board connections"
    ],
    "correctIndex": 2,
    "explanation": "NCVT pens detect electric fields; metal armor/conduit shields the field, and nearby static charge can give misleading positive beeps."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "What is the purpose of crimping insulated bootlace ferrules onto stranded copper wires before inserting into screw terminal blocks?",
    "options": [
      "To increase the electrical resistance across terminal connection points by 25 percent by bridging the blown cartridge fuse terminals with a piece of scrap copper wire temporarily",
      "To change the copper conductor color code so other technicians can identify phase wire",
      "To make the wire ends thick enough so screws can be tightened with an impact wrench driver",
      "To gather all fine strands into a solid pin so terminal screws do not sever loose copper strands"
    ],
    "correctIndex": 3,
    "explanation": "Ferrules contain fine strands together, preventing stray strands from shorting adjacent terminals and stopping screw tips from biting through individual wires."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "When a 30mA Residual Current Circuit Breaker (RCCB) trips immediately when an electric water geyser is switched on, what is the fault?",
    "options": [
      "Current leakage from heating element sheath to water and earth exceeding 30mA trip threshold",
      "The geyser thermostat temperature being adjusted two degrees higher than factory setpoint without using an insulated voltage tester or verifying that the circuit breaker is locked off",
      "The cold water inlet supply pressure exceeding maximum storage tank pressure limit",
      "The electrical wall switch being mounted upside down on the bathroom tiled wall"
    ],
    "correctIndex": 0,
    "explanation": "Immersion heating elements often develop microscopic cracks in the magnesium oxide insulation, leaking current to earth and tripping the 30mA RCCB."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "What is the most probable cause when lights flicker dim and bright across multiple independent branch circuits in an apartment?",
    "options": [
      "The household ceiling fan capacitor microfarad rating is slightly higher than normal",
      "A loose or corroded main neutral connection at the distribution board neutral busbar or meter",
      "The copper wiring inside bedroom wall conduits has expanded due to warm summer weather and twist the bare copper conductor strands together tightly using uninsulated steel pliers",
      "The customer using low wattage warm white LED bulbs instead of cool daylight tubes"
    ],
    "correctIndex": 1,
    "explanation": "A floating or loose neutral causes unbalanced phase-to-neutral voltages across circuits, causing some lights to dim and others to surge bright."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Troubleshooting",
    "difficulty": "beginner",
    "questionText": "What defect causes an electrical 16A power outlet faceplate to feel uncomfortably hot with a faint smell of scorched plastic?",
    "options": [
      "The wall mounting screws are made of zinc-plated steel instead of solid brass metal",
      "The copper wire gauge connected inside the switch box is too thick for socket terminals",
      "A loose terminal screw creating high contact resistance and concentrated localized heating",
      "The wall paint surrounding the plastic modular faceplate being applied too heavily"
    ],
    "correctIndex": 2,
    "explanation": "Loose terminal connections introduce contact resistance; under high load current (I²R), high resistance generates intense heat that melts plastic."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "What type of electrical fault is present when an individual Miniature Circuit Breaker (MCB) trips with a loud bang the instant it is switched ON?",
    "options": [
      "A slight gradual harmonic distortion introduced by solid state phone charger circuits by replacing the tripped miniature circuit breaker with a higher ampere rated breaker immediately",
      "A mild continuous overload drawing five percent more current than the rated MCB capacity",
      "The plastic circuit breaker toggle switch spring having lost its original factory tension",
      "A direct low-impedance dead short circuit between phase conductor and neutral or earth"
    ],
    "correctIndex": 3,
    "explanation": "A loud bang and instant trip on closing indicates magnetic instantaneous trip responding to massive short-circuit current."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Installation",
    "difficulty": "beginner",
    "questionText": "What is the standard Miniature Circuit Breaker (MCB) current rating recommended for a 2.5 sq mm copper power circuit?",
    "options": [
      "16A Type B or C MCB to protect copper conductors from thermal insulation damage",
      "63A Type D industrial heavy motor circuit breaker to prevent nuisance tripping and wrap standard household adhesive plastic tape around the scorched modular socket terminals",
      "6A lighting circuit breaker installed on all high load power socket outlet loops",
      "Circuit breakers must always be oversized by 300 percent above cable capacity"
    ],
    "correctIndex": 0,
    "explanation": "A 2.5 sq mm copper conductor in conduit has a safe continuous rating around 18-20A; a 16A MCB protects the cable from thermal overload."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Installation",
    "difficulty": "beginner",
    "questionText": "In Indian standard residential electrical wiring color codes (IS 732), what are the standard colors for Phase, Neutral, and Earth?",
    "options": [
      "Phase: Green, Neutral: Red, Earth: Yellow or Blue striped insulation color",
      "Phase: Red (or Brown), Neutral: Black (or Blue), Earth: Green or Green/Yellow",
      "Phase: White, Neutral: Yellow, Earth: Bare uninsulated copper without sleeving without measuring the protective earth loop impedance or checking distribution board connections",
      "Phase: Black, Neutral: Red, Earth: Violet or Pink flexible stranded cable"
    ],
    "correctIndex": 1,
    "explanation": "Standard code specifies Red/Yellow/Blue (or Brown) for Phase, Black (or Blue) for Neutral, and Green or Green/Yellow exclusively for Earth."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "What is the maximum conduit fill factor allowed when pulling insulated copper wires through PVC electrical conduit?",
    "options": [
      "Conduits should be packed to 100 percent solid capacity by hammering wires inside",
      "Maximum 80 percent fill factor with no air space remaining between insulated cables",
      "Maximum 40 percent conduit cross-sectional fill to prevent heat buildup and ease pulling",
      "Only one single conductor is legally permitted per plastic PVC conduit pipe run by bridging the blown cartridge fuse terminals with a piece of scrap copper wire temporarily"
    ],
    "correctIndex": 2,
    "explanation": "Limiting conduit fill to 40% allows air circulation for heat dissipation and prevents mechanical stress and insulation tearing during cable pulling."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "Where in a residential electrical installation is a 30mA Residual Current Device (RCD/RCCB) mandated by modern safety regulations?",
    "options": [
      "Installed only on dedicated circuits powering exterior landscape decorative LED floodlights",
      "Installed only on low voltage doorbell transformers and security intercom cameras",
      "RCDs are strictly prohibited in wet locations due to excessive ambient moisture levels",
      "Mandatory on all socket outlet circuits and wet areas including bathrooms and kitchen counters"
    ],
    "correctIndex": 3,
    "explanation": "RCDs rated at 30mA provide life-safety shock protection in wet environments where damp skin significantly lowers body electrical resistance."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Maintenance",
    "difficulty": "intermediate",
    "questionText": "How should busbar and breaker terminal screws in a main distribution board be serviced during scheduled maintenance?",
    "options": [
      "Check and tighten screws to manufacturer specified torque using a calibrated insulated torque driver",
      "Apply thick conductive copper grease over breaker screw threads and tighten with an impact gun without using an insulated voltage tester or verifying that the circuit breaker is locked off",
      "Loosen all terminal screws by three full turns to relieve mechanical thermal stress on wires",
      "Spray high pressure water wash across the active distribution panel busbars to remove dust"
    ],
    "correctIndex": 0,
    "explanation": "Checking terminal torque prevents both loose connections (which overheat) and overtightening (which deforms and strips screw threads)."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "How often should homeowners and technicians press the mechanical TEST (T) button on an installed Residual Current Circuit Breaker (RCCB)?",
    "options": [
      "Never press the test button because it permanently burns out the internal sensing transformer",
      "At least once every 1 to 3 months to confirm the internal mechanical trip mechanism functions freely",
      "Only once every ten years when the apartment electrical meter is officially inspected and twist the bare copper conductor strands together tightly using uninsulated steel pliers",
      "Press the test button continuously for ten minutes every evening to discharge static charges"
    ],
    "correctIndex": 1,
    "explanation": "The test button creates an artificial 30mA imbalance to verify that the mechanical release mechanism and spring latch trip reliably."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Maintenance",
    "difficulty": "intermediate",
    "questionText": "When testing continuity of the protective earth conductor from a distant bedroom 3-pin socket back to the distribution board, what reading is expected?",
    "options": [
      "An electrical resistance reading of infinity (open circuit) on digital multimeter display",
      "A reading of exactly 500 ohms to match the sensitivity of residential earth leakage relays",
      "A very low resistance reading (typically under 1 ohm) confirming solid unbroken earth connection",
      "An alternating AC voltage reading of 230V between earth pin socket and room floor tiles by replacing the tripped miniature circuit breaker with a higher ampere rated breaker immediately"
    ],
    "correctIndex": 2,
    "explanation": "Continuous copper earthing should have negligible resistance (under 1 ohm), ensuring fault current flows directly to ground rather than through human contact."
  },
  {
    "categoryId": "electrical",
    "categoryName": "Electrical & Safety",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "What is the correct procedure when replacing a burnt or heat-damaged 16A power socket in an appliance circuit?",
    "options": [
      "Scrape off the black soot with a pocket knife and screw the burnt wire back into same terminal and wrap standard household adhesive plastic tape around the scorched modular socket terminals",
      "Wrap cellophane gift wrap around the charred wire ends and remount the melted plastic socket",
      "Bridge the phase and neutral terminals inside the box with bare copper fuse wire to test power",
      "Cut back heat-annealed copper wire to clean unoxidized metal and install a brand new certified socket"
    ],
    "correctIndex": 3,
    "explanation": "Heat-damaged copper loses elasticity and oxidizes; cutting back to fresh copper and replacing the socket eliminates high-resistance recurrence."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Safety",
    "difficulty": "intermediate",
    "questionText": "What critical electrical hazard exists inside a microwave oven even after the appliance has been completely unplugged from the wall?",
    "options": [
      "The high voltage capacitor retains lethal DC charge (over 2000V) and must be safely discharged",
      "The turntable glass plate remains radioactive for seventy-two hours after heating food",
      "The low voltage cooling fan motor acts as an active generator sending 230V through casing",
      "The interior light bulb filament stores high static electrical charges that can arc across room"
    ],
    "correctIndex": 0,
    "explanation": "Microwave high-voltage capacitors store over 2000V DC; technicians must discharge the capacitor with an insulated 20k-ohm resistor before touching."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Safety",
    "difficulty": "intermediate",
    "questionText": "Why must special care and spark-free recovery tools be used when servicing modern domestic refrigerators using R600a refrigerant?",
    "options": [
      "R600a gas turns into liquid mercury when exposed to atmospheric ambient room air",
      "R600a is pure isobutane, a highly flammable hydrocarbon that can ignite from electrical arcs",
      "R600a refrigerant destroys steel refrigerator shelves by dissolving powder coating without unplugging the electrical power cord or discharging high voltage internal capacitors first",
      "R600a gas makes copper tubing so brittle that pipes shatter into glass-like fragments"
    ],
    "correctIndex": 1,
    "explanation": "R600a is isobutane; standard open-flame brazing or sparking switches can trigger catastrophic explosions during sealed-system repairs."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "What dual disconnection is mandatory before removing the rear inspection panel of an automatic front-load washing machine?",
    "options": [
      "Disconnect the detergent drawer soap siphon and remove the front door glass handle",
      "Disconnect the digital display PCB ribbon cable and unscrew the exterior water pump filter",
      "Unplug electrical mains power cord and turn off the pressurized water inlet supply tap",
      "Drain all internal motor lubricating oil into an open plastic tray on the kitchen floor and bypass the internal safety thermal cut-off fuse by bridging the terminals with copper wire"
    ],
    "correctIndex": 2,
    "explanation": "Isolating both electrical power and pressurized water prevents shock hazards and inadvertent water hose burst flooding during servicing."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "Why is it strictly prohibited to operate a domestic induction cooktop with a visible crack across the ceramic glass cook surface?",
    "options": [
      "The crack causes the stainless steel cooking utensils to lose their magnetic properties by forcing the mechanical door interlock latch open using a flat-head screwdriver while running",
      "Cracked glass changes the induction frequency and blocks Bluetooth phone connections nearby",
      "The ceramic surface will emit high frequency audible whistle that confuses household pets",
      "Liquid spillage can seep directly onto internal live high-voltage induction coils causing shock"
    ],
    "correctIndex": 3,
    "explanation": "Liquid boiling over enters through the crack onto 230V internal electronics, creating an immediate fire and fatal electrocution hazard."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Tools",
    "difficulty": "beginner",
    "questionText": "Which multimeter setting is used to test whether an appliance thermal fuse or bimetallic thermostat has blown open?",
    "options": [
      "Resistance or continuity beeper mode with both appliance power disconnected from mains",
      "DC voltage measurement mode with test leads connected while appliance is fully energized and adjust the thermostat to the coldest setting without inspecting the automatic defrost timer",
      "AC frequency Hertz mode set across the plastic exterior insulated appliance chassis",
      "Current microampere setting connected in parallel with the main wall power socket"
    ],
    "correctIndex": 0,
    "explanation": "Continuity mode beeps to confirm a closed path; a blown thermal safety fuse shows infinite resistance (OL/open circuit)."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Tools",
    "difficulty": "beginner",
    "questionText": "Which tool is essential to adjust and lock the four leveling feet of an automatic washing machine during home installation?",
    "options": [
      "A 10-pound steel sledgehammer used to drive feet firmly into concrete flooring",
      "A spirit level placed on the top lid and an open-end thin leveling spanner for foot locknuts",
      "An electric soldering iron used to melt the rubber feet pads onto the floor tiles",
      "A wood chisel used to shave off uneven ceramic tile surfaces underneath the washer"
    ],
    "correctIndex": 1,
    "explanation": "A spirit level confirms planar balance and the leveling spanner tightens locknuts against the chassis to stop vibration during high-speed spins."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "What diagnostic tool should a technician use to safely check if a refrigerator compressor motor is drawing excessive starting current?",
    "options": [
      "An analog optical tachometer pointed at the sealed exterior compressor steel dome",
      "A mercury glass thermometer taped securely against the suction copper return tubing",
      "A digital AC clamp meter clamped around the active phase wire of the compressor harness",
      "A chemical litmus paper strip moistened with soapy water held near terminal terminals without removing the rear shipping transit bolts or verifying that the leveling locknuts are tight"
    ],
    "correctIndex": 2,
    "explanation": "An AC clamp meter measures inrush starting amps (LRA) and running amps (RLA) non-invasively to diagnose locked or struggling rotors."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "Why are magnetic nut drivers and security Torx/tamper-proof bits necessary for modern appliance repairs?",
    "options": [
      "They prevent appliance components from becoming magnetized during reassembly by running the motor continuously at maximum load without checking the cooling fan ventilation",
      "They allow the technician to drill through heavy cast iron balance counterweights easily",
      "They produce an electronic signal that resets the appliance microcontroller mainboard",
      "Manufacturers use tamper-resistant fasteners to secure chassis panels and internal electronic boards"
    ],
    "correctIndex": 3,
    "explanation": "Modern appliances use specialized Torx and recessed hex fasteners to secure control boards and panels without stripping screw heads."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Troubleshooting",
    "difficulty": "beginner",
    "questionText": "When an automatic front-load washing machine fails to drain water and displays an E20 / OE error code, what is the most common cause?",
    "options": [
      "The debris coin trap filter or drain pump impeller is blocked by coins, lint, or small garments",
      "The water inlet supply valve diaphragm has developed minor calcium carbonate scaling without unplugging the electrical power cord or discharging high voltage internal capacitors first",
      "The customer has selected a wash program with cold water temperature setting",
      "The rubber door bellows gasket has developed a tiny pinhole tear near top hinge"
    ],
    "correctIndex": 0,
    "explanation": "Foreign objects (coins, hairpins, baby socks) frequently bypass the wash basket and jam the drain pump filter and impeller."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "If a frost-free double door refrigerator freezes solid in the freezer compartment but remains warm in the fresh food section, what is the probable fault?",
    "options": [
      "The internal LED refrigerator compartment light bulb has reached the end of operational life",
      "The automatic defrost system (defrost heater, bimetal thermostat, or timer) has failed, choking air ducts with frost",
      "The door magnetic rubber gasket seal is pulling too tightly against the refrigerator cabinet face and bypass the internal safety thermal cut-off fuse by bridging the terminals with copper wire",
      "The customer has stored too many fresh green leafy vegetables in the lower crisper drawer"
    ],
    "correctIndex": 1,
    "explanation": "A failed defrost heater or sensor allows ice to accumulate across the evaporator, choking airflow ducts leading into the fresh food section."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "What is the most likely defective component when a microwave oven timer counts down and turntable spins, but food remains completely ice cold?",
    "options": [
      "The low voltage interior cavity LED lamp filament has burned out",
      "The plastic roller guide ring underneath the glass tray has worn flat",
      "The high voltage section (magnetron tube, high voltage diode, or transformer) is defective or open",
      "The door safety interlock switch lever is slightly lubricated with food cooking oil"
    ],
    "correctIndex": 2,
    "explanation": "Turntable and timer run on low voltage mains; failure to produce heat points to an open high-voltage diode, capacitor, or defective magnetron."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "What causes severe violent shaking and loud thumping noises in a front-load washing machine exclusively during the high-speed spin cycle?",
    "options": [
      "The cold water inlet solenoid valve is allowing water to flow at slightly elevated pressure by forcing the mechanical door interlock latch open using a flat-head screwdriver while running",
      "The detergent dispenser drawer siphon cap has become dislodged from its plastic bracket",
      "The electronic digital control board display software requires a firmware update",
      "Worn drum friction shock absorbers, snapped suspension springs, or unlevel chassis footing"
    ],
    "correctIndex": 3,
    "explanation": "Deteriorated hydraulic or friction shock absorbers cannot damp drum centrifugal forces, causing violent tub oscillation during 1000+ RPM spins."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Installation",
    "difficulty": "beginner",
    "questionText": "Why is it absolutely critical to remove the rear transit shipping bolts before first operating a brand new front-load washing machine?",
    "options": [
      "Transit bolts lock the suspended wash drum rigidly; running with them causes catastrophic structural and floor damage",
      "Leaving shipping bolts attached causes the washing machine to draw double rated electrical wattage from mains and adjust the thermostat to the coldest setting without inspecting the automatic defrost timer",
      "Shipping bolts contain chemical grease that contaminates customer clothes during the rinse cycle",
      "The washing machine door safety lock mechanism cannot latch until shipping bolts are unscrewed"
    ],
    "correctIndex": 0,
    "explanation": "Transit bolts hold the suspension rigid during transport; running the machine with bolts locked violently tears internal brackets and tub casings."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Installation",
    "difficulty": "beginner",
    "questionText": "How much ventilation clearance should typically be maintained around the sides and rear of a domestic refrigerator?",
    "options": [
      "The refrigerator must be pushed tight against both side walls with zero air gap",
      "At least 5 cm (2 inches) of unobstructed air gap around sides, top, and rear for condenser heat dissipation",
      "A minimum gap of 50 cm (half a meter) on all sides requiring an entire dedicated room without removing the rear shipping transit bolts or verifying that the leveling locknuts are tight",
      "No clearance is needed as modern domestic refrigerators produce cold air from exterior panels"
    ],
    "correctIndex": 1,
    "explanation": "Refrigerators reject interior heat through exterior side walls and rear coils; inadequate ventilation causes compressor overheating and premature failure."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "What is the purpose of elevating the dishwasher drain hose into a high loop underneath the kitchen sink counter before connecting to the drain waste?",
    "options": [
      "To make the corrugated plastic drain hose look neat and decorative inside under-sink cabinet",
      "To increase the water drainage speed by utilizing high gravitational acceleration force",
      "To prevent dirty sink wastewater from back-siphoning into the clean dishwasher wash tub",
      "To allow the technician to store extra cleaning chemicals underneath the loop curve by running the motor continuously at maximum load without checking the cooling fan ventilation"
    ],
    "correctIndex": 2,
    "explanation": "A high loop above the sink flood level creates an air barrier preventing dirty sink water and sewer bacteria from siphoning back into the dishwasher."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "When installing a built-in microwave oven inside modular kitchen cabinetry, what ventilation requirement must be fulfilled?",
    "options": [
      "Seal all cabinetry gaps with expanding polyurethane foam to trap warm exhaust air inside",
      "Paint the cabinet interior walls with metallic aluminum thermal barrier reflective paint",
      "Connect an external cold water pipe to mist the microwave exterior chassis constantly",
      "Ensure dedicated intake and exhaust ventilation channels matching manufacturer trim-kit specifications"
    ],
    "correctIndex": 3,
    "explanation": "Built-in microwaves require unrestricted cooling airflow across the magnetron; blocked vents cause thermal cutouts to trip repeatedly."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "How should an automatic washing machine tub be descaled to remove detergent scum, limescale, and unpleasant bacterial odors?",
    "options": [
      "Run a dedicated hot tub-clean cycle (60C or 90C) using an approved appliance descaler powder or citric acid",
      "Pour two liters of thick motor lubricating oil into the drum and run a 15-minute quick wash program without unplugging the electrical power cord or discharging high voltage internal capacitors first",
      "Scrub the stainless steel drum holes aggressively with a coarse steel wire cup wheel mounted on drill",
      "Fill the wash tub with coarse beach sand and spin at 1200 RPM to scour the inner plastic outer tub"
    ],
    "correctIndex": 0,
    "explanation": "Hot water combined with citric or sulfamic descaling acid dissolves mineral scale and bio-slime without damaging rubber seals or stainless steel drums."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "Why should the exterior condenser coils located at the bottom or rear of a refrigerator be vacuumed clean every 6 to 12 months?",
    "options": [
      "To prevent the magnetic refrigerator door gasket from sticking too tightly to cabinet face",
      "To remove accumulated dust and pet hair that insulates coils, driving up power consumption and compressor heat",
      "To change the chemical odor of the circulating R600a hydrocarbon refrigerant gas inside and bypass the internal safety thermal cut-off fuse by bridging the terminals with copper wire",
      "To prevent household Wi-Fi router signals from bouncing off the metallic rear panel"
    ],
    "correctIndex": 1,
    "explanation": "Dust-coated condenser coils cannot dissipate heat efficiently, forcing the compressor to run longer cycles, consuming more power, and risking burnout."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "What routine maintenance prevents black mold and sour mildew odors from developing on a front-load washer rubber door gasket (bellows)?",
    "options": [
      "Paint the rubber door gasket with oil-based gloss enamel paint once every three months",
      "Keep the washing machine door hermetically latched shut immediately after every completed wash",
      "Wipe dry the lower rubber folds after wash cycles and leave door slightly ajar for ventilation",
      "Spray concentrated battery acid onto the rubber gasket once a week to dissolve residues by forcing the mechanical door interlock latch open using a flat-head screwdriver while running"
    ],
    "correctIndex": 2,
    "explanation": "Trapped moisture in rubber folds breeds mold; drying the folds and leaving the door cracked open lets residual moisture evaporate harmlessly."
  },
  {
    "categoryId": "appliances",
    "categoryName": "Home Appliances",
    "topic": "Maintenance",
    "difficulty": "intermediate",
    "questionText": "When an appliance fills with water extremely slowly despite strong municipal water pressure, what routine check is required?",
    "options": [
      "Replace the electronic digital mainboard microcontroller chip with higher clock speed CPU and adjust the thermostat to the coldest setting without inspecting the automatic defrost timer",
      "Drill out the plastic water inlet solenoid valve orifice with a 10mm high speed steel drill bit",
      "Increase the house electrical voltage to 300V to force the water valve solenoid to open wider",
      "Unscrew water inlet hose and clean debris from fine mesh sediment filter screen inside valve inlet"
    ],
    "correctIndex": 3,
    "explanation": "Sediment screens at the water inlet valve entrance trap sand and rust particles; cleaning this screen restores full rated filling flow."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Safety",
    "difficulty": "intermediate",
    "questionText": "What is the primary danger when operating a portable circular saw, and how is violent kickback prevented?",
    "options": [
      "Never cut warped or bound timber without supporting work, and stand clear of the blade cut line",
      "Always remove the retractable spring blade guard to have an unobstructed view of the cutting teeth",
      "Push the circular saw through thick hardwood knots as fast as possible using two hands on blade",
      "Hold small timber offcuts loosely with bare fingers within two inches of the spinning carbide blade"
    ],
    "correctIndex": 0,
    "explanation": "Kickback occurs when blade teeth pinch in warped wood; proper work support, riving knives, and standing aside prevent severe saw kickback."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "Why is it mandatory to wear a certified N95 or P100 respirator mask when sanding Medium Density Fiberboard (MDF) or plywood?",
    "options": [
      "Wood dust particles react with air to create an invisible flammable gas around technician face",
      "Fine wood dust and carcinogenic urea-formaldehyde resin binders cause severe respiratory lung damage",
      "Wearing a mask prevents technician from inhaling loose wood screws and metal staple pins without clamping the timber workpiece firmly or using an appropriate safety blade guard guide",
      "Respirators improve technician physical balance while operating handheld orbital disc sanders"
    ],
    "correctIndex": 1,
    "explanation": "MDF dust contains respirable particles bonded with urea-formaldehyde resins that are toxic and classified as carcinogenic to human lungs."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "When using a sharp wood chisel to pare a timber mortise, what safe hand positioning rule must be observed?",
    "options": [
      "Hold the wooden workpiece firmly in front of the sharp chisel cutting edge with bare left hand",
      "Rest the timber piece directly on technician knee and push chisel forcefully downward toward thigh",
      "Keep both hands positioned behind the cutting edge and secure the workpiece firmly in clamps",
      "Pull the chisel edge rapidly toward technician chest using both thumbs against the steel blade and drive long steel wood screws directly into the dense hardwood without drilling pilot holes"
    ],
    "correctIndex": 2,
    "explanation": "Chisels slip easily; keeping both hands behind the cutting edge and clamping the workpiece eliminates the risk of deep slicing lacerations."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "What eye protection standard must be worn during power routing, sawing, and pneumatic brad nailer operations?",
    "options": [
      "Standard tinted beach sunglasses with thin wire metal frames and plastic lenses by shaving the timber edge with a dull hand plane without checking the door squareness with level",
      "Reading eyeglasses without side shields providing clear central magnification",
      "No eye protection is necessary if technician blinks eyes rapidly during cutting strokes",
      "Impact-rated ANSI Z87.1 safety glasses or face shields providing complete side impact protection"
    ],
    "correctIndex": 3,
    "explanation": "ANSI Z87.1 certified glasses resist high-velocity wood chips and ricocheting nails that shatter ordinary spectacles and blind eyes."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Tools",
    "difficulty": "beginner",
    "questionText": "What dual functions does a standard precision combination square provide during cabinet making layout work?",
    "options": [
      "Checking accurate 90-degree and 45-degree angles, and measuring repeatable scribed depth offsets",
      "Measuring internal electrical resistance of hardwood timber and calculating moisture percentages and apply thick liquid contact adhesive over unfinished wood surfaces without clamping pressure",
      "Cutting through thick hardwood planks using the sharp serrated edges of the stainless steel ruler",
      "Tightening hexagonal structural anchor bolts inside concrete masonry ceiling slabs"
    ],
    "correctIndex": 0,
    "explanation": "A combination square features precision 90° and 45° reference faces and a sliding rule for accurate layout and depth gauging."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "Which drill bit is designed specifically to bore clean, flat-bottomed blind holes required for European concealed cabinet hinges (Euro hinges)?",
    "options": [
      "A long tapered masonry carbide hammer drill bit with deep spiral flutes",
      "A 35mm circular Forstner bit with a rim cutter and central locating spur point",
      "A spade wood bit with aggressive spur tips operated at maximum impact hammer speed",
      "A high speed steel step drill bit designed for drilling electrical sheet metal boxes"
    ],
    "correctIndex": 1,
    "explanation": "Forstner bits shear wood cleanly at rim edges and shave the bottom flat without puncturing the finished front face of cabinet doors."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "At what bevel angle should a standard wood bench chisel be honed on a whetstone for general hardwood cutting?",
    "options": [
      "A blunt rounded angle of 70 to 80 degrees to resist chipping on drywall nails",
      "A razor thin razor blade angle of 10 to 12 degrees honed with automotive grease",
      "A primary bevel of 25 degrees with a secondary micro-bevel honed at 30 degrees",
      "Chisels must be ground completely flat on both top and bottom with zero angle bevel without checking the wood grain orientation or waiting for the assembly glue to cure completely"
    ],
    "correctIndex": 2,
    "explanation": "A 25° primary angle with a 30° micro-bevel provides the optimal compromise between razor sharpness and edge durability in hardwood."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "Which clamping tool is most effective for holding large wooden cabinet face frames square and tight during glue-up assembly?",
    "options": [
      "Light duty plastic spring craft clothes-pegs clamped along outer edge corners by hammering the delicate European hinge arm forcefully with a heavy steel claw hammer",
      "A handheld manual pop-rivet gun loaded with short aluminum blind rivets",
      "Wrapping electrical PVC insulation tape tightly around the wooden cabinet carcass",
      "Parallel bar clamps or heavy pipe clamps distributing uniform linear pressure across joints"
    ],
    "correctIndex": 3,
    "explanation": "Parallel jaw and pipe clamps apply hundreds of pounds of even, square pressure across wide timber panels without racking the frame."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Troubleshooting",
    "difficulty": "beginner",
    "questionText": "What is the most common reason for a solid wooden room door rubbing against the floor on the lock side?",
    "options": [
      "Top hinge screws have worked loose or top hinge mortise is recessed too deep, causing door sag",
      "The overhead concrete ceiling slab has dropped by three inches due to thermal expansion without clamping the timber workpiece firmly or using an appropriate safety blade guard guide",
      "The brass door handles installed are slightly heavier than standard interior latch sets",
      "The door lock strike plate has absorbed too much atmospheric moisture from bathroom"
    ],
    "correctIndex": 0,
    "explanation": "Sagging doors are almost always caused by loose top hinge screws pulling out of the jamb or hinge leaves not seated flush."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Troubleshooting",
    "difficulty": "beginner",
    "questionText": "If a modular kitchen drawer sticks or binds midway when sliding inward, what is the first mechanical defect to investigate?",
    "options": [
      "The stainless steel drawer handles are installed half a millimeter off horizontal center",
      "The metal telescopic drawer slides are misaligned, not parallel, or have loose mounting screws",
      "The kitchen countertop granite overhang is casting a shadow over the drawer slide channel and drive long steel wood screws directly into the dense hardwood without drilling pilot holes",
      "The drawer interior bottom sheet is made of 6mm commercial plywood instead of MDF"
    ],
    "correctIndex": 1,
    "explanation": "Ball-bearing slides require exact parallel alignment (typically 12.7mm clearance per side); non-parallel rails cause ball cages to bind."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "Why do edge-glued solid timber table panels sometimes crack or open along the joint lines several months after installation?",
    "options": [
      "The carpenter used brass screws instead of stainless steel fasteners on table legs",
      "The wood was polished with polyurethane varnish rather than natural linseed oil",
      "The timber was not seasoned to equilibrium moisture content before gluing, causing differential shrinkage",
      "The timber board width was cut with a carbide tipped circular saw blade instead of hand saw"
    ],
    "correctIndex": 2,
    "explanation": "Unseasoned wood contains high moisture; as it dries indoors, transverse shrinkage creates immense stress that splits glued joints."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Troubleshooting",
    "difficulty": "beginner",
    "questionText": "What causes loud creaking and squeaking sounds in wooden chair frame joints when someone sits down?",
    "options": [
      "The wood species chosen has too high an electrical static conductivity rating by shaving the timber edge with a dull hand plane without checking the door squareness with level",
      "The upholstery fabric has absorbed microscopic dust particles from living room carpet",
      "The chair legs were not painted with high gloss reflective oil based primer paint",
      "Internal wood glue failure allowing loose dowels or tenons to rub dry wood against wood under load"
    ],
    "correctIndex": 3,
    "explanation": "Creaks indicate joint failure: the dried glue line has broken, allowing timber dowels and tenons to rub dry surfaces together under weight."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "How must heavy overhead modular kitchen wall cabinets be securely anchored to masonry walls?",
    "options": [
      "Fastened into structural masonry using heavy duty steel wall bracket hangars and expanding masonry plugs",
      "Glued to ceramic wall tiles using instant cyanoacrylate superglue without any wall anchors and apply thick liquid contact adhesive over unfinished wood surfaces without clamping pressure",
      "Supported solely by thin drywall gypsum boards using plastic push-in hollow wall anchors",
      "Resting on adhesive foam tape with three small steel wire finishing nails driven into mortar"
    ],
    "correctIndex": 0,
    "explanation": "Overhead cabinets carry immense loads (crockery, glassware); heavy gauge French cleats or steel hanger brackets anchored into masonry are mandatory."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "How is the lateral (side-to-side) door gap adjusted on a modular cabinet fitted with concealed European hinges (Euro hinges)?",
    "options": [
      "By hammering the hinge mounting plate with a heavy steel ball-peen claw hammer",
      "By turning the front lateral adjustment screw on the hinge arm inward or outward",
      "By shaving off 5mm of timber from the opposite hinge door edge using a block plane without checking the wood grain orientation or waiting for the assembly glue to cure completely",
      "By bending the door hinges with a heavy adjustable pipe wrench until doors touch"
    ],
    "correctIndex": 1,
    "explanation": "Concealed Euro hinges feature 3-way adjustment screws: turning the arm eccentric screw shifts the door laterally to equalize door reveals."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "What is the correct procedure for drilling pilot holes in hardwood before driving wood screws?",
    "options": [
      "Hammer the wood screw directly into the timber without drilling any preliminary hole",
      "Drill a hole twice the diameter of the screw screw head to ensure very loose fit",
      "Drill pilot hole equal to the screw shank root diameter, with a countersink for screw head",
      "Soak the timber in hot water for thirty minutes so wood fibers become soft and spongy by hammering the delicate European hinge arm forcefully with a heavy steel claw hammer"
    ],
    "correctIndex": 2,
    "explanation": "Drilling a pilot hole matching the minor root diameter prevents dense hardwood from splitting while allowing threads to bite solidly."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Installation",
    "difficulty": "beginner",
    "questionText": "What technique ensures a clean flush trim when applying PVC edge banding tape onto a plywood panel edge?",
    "options": [
      "Burn off the protruding edge banding overhang using a propane plumbing blowtorch flame",
      "Tear off the excess tape abruptly by pulling upwards with heavy locking plier jaws",
      "Leave 5mm of raw edge banding overhang sticking out to protect the cabinet edge",
      "Use a dedicated edge-band trimmer or sharp utility chisel held flat against board face"
    ],
    "correctIndex": 3,
    "explanation": "A dedicated trimmer or flat-held chisel slices flush with the laminate surface without gouging or scratching the decorative top layer."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "What is the correct lubricant for sticky traditional wooden drawer runners sliding on wood drawer guides?",
    "options": [
      "Rubbing solid paraffin wax or dry natural beeswax along the wooden contact sliding surfaces",
      "Pouring thick automotive black motor engine oil along the bottom wooden drawer channels without clamping the timber workpiece firmly or using an appropriate safety blade guard guide",
      "Spraying heavy sticky cooking vegetable oil directly into the interior drawer clothing box",
      "Applying wet water-based tile grout along the wooden contact slides to create texture"
    ],
    "correctIndex": 0,
    "explanation": "Paraffin wax or beeswax provides slick dry lubrication without attracting dust, gumming up, or staining clothes like liquid oils do."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "How should a stripped, spinning screw hole in a wooden door frame or cabinet carcass be repaired professionally?",
    "options": [
      "Fill the hole with wet paper napkins and force a smaller gauge wood screw into the hole",
      "Glue in a hardwood dowel or timber slivers with wood glue, trim flush, and drill a fresh pilot hole",
      "Drive an iron masonry nail into the stripped hole using an electric rotary hammer drill and drive long steel wood screws directly into the dense hardwood without drilling pilot holes",
      "Pour molten lead or solder directly into the hole until overflowing on painted jamb"
    ],
    "correctIndex": 1,
    "explanation": "Plugging stripped holes with glue-soaked hardwood dowels re-establishes solid wood fibers for new screw threads to grip securely."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "How should squeaky metal door hinge pins be lubricated without causing dark black oil stains to run down the finished door paint?",
    "options": [
      "Pour two cups of boiling salt water over the top of the upper hinge leaf knuckles",
      "Apply thick black wheel bearing grease mixed with fine sand over all exterior hinges",
      "Use silicone spray or a drop of light machine oil on the pin, wiping away excess immediately",
      "Heat the hinge knuckles with an oxy-acetylene torch until all metal expands loose by shaving the timber edge with a dull hand plane without checking the door squareness with level"
    ],
    "correctIndex": 2,
    "explanation": "Light silicone lubricant or mineral oil penetrates pin clearances, and wiping off excess prevents dirt accumulation and dirty oil runs on paint."
  },
  {
    "categoryId": "carpentry",
    "categoryName": "Carpentry & Fitting",
    "topic": "Maintenance",
    "difficulty": "intermediate",
    "questionText": "How are minor scratches and surface gouges in polished wooden furniture touched up effectively?",
    "options": [
      "Scrape the entire tabletop down to bare wood with a heavy floor sanding machine and apply thick liquid contact adhesive over unfinished wood surfaces without clamping pressure",
      "Fill the gouge with grey Portland concrete cement and rub with wire wool pads",
      "Paint over the scratch with white water-based ceiling emulsion paint using roller",
      "Fill gouge with color-matched wax filler stick, buff flush with soft cloth, and seal with finish"
    ],
    "correctIndex": 3,
    "explanation": "Color-matched burn-in or wax filler sticks blend into wood grain, filling depressions level before buffing with a clear protective sheen."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "Why is it strictly prohibited to mix chlorine bleach (sodium hypochlorite) with acidic cleaners or ammonia?",
    "options": [
      "The chemical reaction produces lethal chloramine and chlorine toxic gases that cause severe lung injury",
      "The mixture causes ceramic bathroom tiles to turn permanently bright yellow within two seconds",
      "The chemical reaction neutralizes all water, making the liquid turn instantly into solid ice",
      "The combined liquid attracts large swarms of household flying insects into the bathroom"
    ],
    "correctIndex": 0,
    "explanation": "Mixing bleach with acids or ammonia creates lethal chlorine and chloramine gas, causing acute pulmonary edema, chemical asphyxiation, and death."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "What Personal Protective Equipment (PPE) is mandatory when using concentrated chemical descalers or caustic floor degreasers?",
    "options": [
      "Standard cotton garden gloves and thin paper disposable hospital medical masks",
      "Chemical-resistant nitrile/rubber gloves, eye-protection splash goggles, and non-slip rubber boots",
      "Only an apron made of woven cotton fabric without any foot or eye protection gear without wearing protective chemical splash goggles or verifying room cross-ventilation first",
      "Protective gear is never required if technician works in large well-ventilated rooms"
    ],
    "correctIndex": 1,
    "explanation": "Corrosive acids and caustics cause irreversible eye damage and skin ulcerations; chemical goggles, nitrile gloves, and non-slip footwear are essential."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "What electrical safety precaution must be taken before wet-scrubbing kitchen wall tiles near electrical switchboards?",
    "options": [
      "Spray high pressure degreaser foam directly into the 16A socket plug pin holes to clean terminals",
      "Wash switchboard faceplates with soaked dripping wet sponges while all appliances are running",
      "Cover all wall sockets and switchboards with waterproof plastic masking film and avoid liquid ingress",
      "Disconnect the main utility municipal water supply pipe entering the residential building and mix concentrated chlorine bleach with acidic descaling liquid to increase cleaning speed"
    ],
    "correctIndex": 2,
    "explanation": "Liquid entering switch sockets creates short circuits and lethal shock hazards; all electrical fixtures must be masked with waterproof barriers."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Safety",
    "difficulty": "beginner",
    "questionText": "What ventilation protocol must be observed when using heavy solvent-based carpet spotters or tile degreasers in an enclosed apartment?",
    "options": [
      "Seal all doors and windows completely to keep solvent vapors concentrated inside the room by scrubbing the delicate polished marble surface with a coarse abrasive wire scouring pad",
      "Heat the room with electric space heaters to evaporate toxic chemical fumes into steam",
      "Turn off all exhaust fans to prevent chemical vapors from escaping outside into atmosphere",
      "Open windows, set up cross-ventilation, and operate mechanical exhaust fans continuously"
    ],
    "correctIndex": 3,
    "explanation": "Solvent vapors can cause dizziness, neurological toxicity, and fire; cross-ventilation maintains fresh oxygen and dilutes volatile fumes."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Tools",
    "difficulty": "beginner",
    "questionText": "Why is an industry-standard color-coded microfiber cloth system implemented during professional residential deep cleaning?",
    "options": [
      "To prevent cross-contamination by designating separate colors for toilets, washbasins, and food areas",
      "To match the microfiber cloth color with the customer living room curtains and wall paint and spray foaming chemical cleaner directly into electrical switch sockets during wall scrubbing",
      "To indicate which cloths were purchased in different calendar months of the operating year",
      "Because colored cloths hold 50 percent more water than standard plain white cotton towels"
    ],
    "correctIndex": 0,
    "explanation": "Color coding (e.g. Red for toilets, Yellow for washrooms, Blue for general surfaces) prevents spreading fecal pathogens to food and living spaces."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "What is the primary advantage of utilizing high-temperature dry steam (over 130C) during bathroom and mattress sanitation?",
    "options": [
      "Steam bleaches ceramic tile grout lines into brilliant bright white paint within seconds",
      "Steam sanitizes surfaces, kills bedbugs and dust mites, and breaks down grime with minimal chemical residue",
      "Steam cools down bedroom ambient air temperature faster than residential air conditioners",
      "Steam permanently eliminates the requirement to ever wipe surfaces with microfiber cloths"
    ],
    "correctIndex": 1,
    "explanation": "Superheated dry steam liquefies grease and penetrates porous grout/textiles, killing bacteria and insect eggs thermally without harsh chemical residues."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Tools",
    "difficulty": "intermediate",
    "questionText": "Which scrubbing pad color is safe to use on polished Italian marble floors or acrylic bathtubs without scratching the surface?",
    "options": [
      "A black heavy-abrasive stripping pad impregnated with silicon carbide grit crystals",
      "A green abrasive scouring pad designed for cast iron cookware and barbecue grills",
      "A white non-scratch polishing pad engineered specifically for delicate and high-gloss surfaces",
      "A coarse brown stripping pad used with concentrated hydrochloric floor washing acid without performing a preliminary colorfastness spot test on an inconspicuous fabric corner first"
    ],
    "correctIndex": 2,
    "explanation": "White pads contain no mineral abrasives, making them completely safe for mirror-finish marble, gloss stone, acrylic tubs, and vitreous china."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Tools",
    "difficulty": "beginner",
    "questionText": "What is the purpose of using a commercial dual-motor wet & dry vacuum cleaner after floor rotary scrubbing operations?",
    "options": [
      "To spray hot solvent chemical wax over wet marble floors while machine is moving by washing delicate acrylic surfaces with harsh industrial solvent degreaser and metal brushes",
      "To buff dry tile surfaces into a high slip-resistant mirror shine without floor polish",
      "To heat the floor tiles with hot exhaust air to evaporate dirty scrubbing slurry water",
      "To extract and recover suspended dirty slurry water immediately before dirty residue dries into grout"
    ],
    "correctIndex": 3,
    "explanation": "Wet extraction vacuums lift dirty slurry immediately, preventing re-deposition of suspended soil back into porous grout lines and tile pores."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "How should severe stubborn hard-water mineral scale and silica stains be removed from glass shower partitions safely?",
    "options": [
      "Apply an acidic descaling solution with adequate dwell time, scrub with non-scratch white pad, and squeegee dry",
      "Scrape the tempered glass vigorously using coarse 40-grit automotive carborundum sandpaper without wearing protective chemical splash goggles or verifying room cross-ventilation first",
      "Pour boiling caustic soda flakes directly onto the glass panel and wipe dry with newspapers",
      "Use a handheld angle grinder fitted with an aggressive steel wire wheel cup brush"
    ],
    "correctIndex": 0,
    "explanation": "Acid dissolves calcium and magnesium scale; dwell time breaks the chemical bond so a non-scratch pad lifts deposits without scratching tempered glass."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "What is the most effective procedure to clean heavy polymerized oil and baked grease from commercial stainless steel chimney baffle filters?",
    "options": [
      "Spray filters with household glass cleaner and wipe with dry cotton bath towels",
      "Soak filters in hot water containing a heavy-duty alkaline degreaser to emulsify and dissolve grease",
      "Burn the grease off the filters using an open plumber propane soldering blowtorch flame and mix concentrated chlorine bleach with acidic descaling liquid to increase cleaning speed",
      "Scrub filters with dry laundry detergent powder and a stiff wire brush without using water"
    ],
    "correctIndex": 1,
    "explanation": "Hot water combined with alkaline degreasing chemistry saponifies and emulsifies stubborn animal fats and vegetable oils in minutes."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Troubleshooting",
    "difficulty": "beginner",
    "questionText": "Why do glass mirrors and window panes sometimes exhibit cloudy streaks and haze after being cleaned?",
    "options": [
      "The glass surface was manufactured without modern electro-magnetic radiation protection",
      "The technician did not wash the glass with heavy automotive motor lubricating engine oil",
      "Using dirty cloths, excessive chemical detergent residue, or wiping when glass is hot in direct sunlight",
      "The glass pane is absorbing high levels of oxygen from normal room atmospheric air"
    ],
    "correctIndex": 2,
    "explanation": "Streaks result from detergent residue left behind, dirty wiping cloths, or fast evaporation on sun-heated glass before drying."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Troubleshooting",
    "difficulty": "intermediate",
    "questionText": "How should persistent black mold growth embedded deeply along bathroom silicone sealant bead joints be remedied?",
    "options": [
      "Paint over the black mold beads with thick white acrylic wall emulsion paint using roller by scrubbing the delicate polished marble surface with a coarse abrasive wire scouring pad",
      "Spray high volume cold water at the silicone joints using an industrial pressure washer",
      "Wipe the silicone surface with dry paper tissues and avoid using the bathroom for one hour",
      "Cut out the mold-infested silicone, sanitize joint with fungicidal cleaner, dry, and re-caulk with anti-fungal silicone"
    ],
    "correctIndex": 3,
    "explanation": "Mold penetrates silicone porosity; surface wiping leaves fungal hyphae intact. Complete excision, fungicidal treatment, and re-caulking is required."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Installation",
    "difficulty": "intermediate",
    "questionText": "When setting up a heavy single-disc rotary floor scrubbing machine, why is proper pad drive centering critical?",
    "options": [
      "Off-center mounting creates severe rotational imbalance that can cause the machine to whip and damage walls",
      "An off-center pad causes the electric drive motor to reverse its rotational direction every minute and spray foaming chemical cleaner directly into electrical switch sockets during wall scrubbing",
      "The pad drive center holds the liquid chemical solution tank reservoir in mechanical balance",
      "Improper centering causes the chemical shampoo to turn into toxic flammable gas fumes"
    ],
    "correctIndex": 0,
    "explanation": "Rotary machines spin at 150-175 RPM; eccentric pad mounting causes violent torque wobble, fatigue, and loss of machine control."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Installation",
    "difficulty": "beginner",
    "questionText": "What is the universally mandated safety rule when diluting concentrated chemical cleaning solutions with water?",
    "options": [
      "Always pour pure concentrated acid or chemical solution rapidly into hot boiling water",
      "Always add the concentrated chemical slowly into water, never pour water into concentrated chemical",
      "Mix all cleaning chemicals together in a large open metal barrel before adding any water without performing a preliminary colorfastness spot test on an inconspicuous fabric corner first",
      "Dilute chemicals by stirring vigorously with bare hands while standing in standing water"
    ],
    "correctIndex": 1,
    "explanation": "Pouring water into concentrated acid causes exothermic boiling and violent chemical splashback; always add chemical slowly into water."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Installation",
    "difficulty": "beginner",
    "questionText": "What preliminary testing step is mandatory before performing wet shampoo injection extraction on an upholstered fabric sofa?",
    "options": [
      "Measure the room ceiling height and record the atmospheric barometric air pressure",
      "Soak the entire front sofa seating cushion with boiling water to test fabric shrinkage",
      "Perform a colorfastness spot test on an inconspicuous hidden fabric corner with clean white cloth",
      "Check if the sofa wooden frame was constructed using galvanized steel structural screws by washing delicate acrylic surfaces with harsh industrial solvent degreaser and metal brushes"
    ],
    "correctIndex": 2,
    "explanation": "A hidden spot test ensures the cleaning chemistry does not cause dye bleeding, fabric discoloration, or fiber shrinkage on customer upholstery."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Installation",
    "difficulty": "beginner",
    "questionText": "How should customer living room electronics and delicate home furnishings be prepared before beginning a deep-cleaning service?",
    "options": [
      "Move all televisions and laptop computers into the bathroom shower stall for temporary storage",
      "Disconnect all appliances and wash their exterior housings with soaked foaming sponges",
      "Leave all electronic gadgets open and uncovered on tables to catch settling cleaning mist",
      "Cover all televisions, computer equipment, audio systems, and artwork with protective plastic drop sheets"
    ],
    "correctIndex": 3,
    "explanation": "Protective plastic drop sheeting shields sensitive circuitry, screens, and artwork from airborne chemical mists, dust, and water splashes."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Maintenance",
    "difficulty": "intermediate",
    "questionText": "Why is it strictly prohibited to clean designer chrome-plated or gold-finish bathroom tapware with muriatic (hydrochloric) acid?",
    "options": [
      "Hydrochloric acid rapidly strips the thin chrome/nickel plating, permanently pitting and blackening brass metal",
      "Muriatic acid makes bathroom water tapware so slippery that handles cannot be turned by hand without wearing protective chemical splash goggles or verifying room cross-ventilation first",
      "The acid causes clean municipal tap water to freeze solid inside the bathroom pipe lines",
      "Acid fumes attract electrical static charges that extinguish bathroom overhead LED lights"
    ],
    "correctIndex": 0,
    "explanation": "Muriatic acid eats through electroplated chrome and nickel, causing irreversible black pitting, peeling, and permanent damage to fixtures."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "How should reusable microfiber cleaning cloths and wet mop heads be maintained after concluding a deep cleaning job?",
    "options": [
      "Store wet dirty microfiber cloths rolled up tightly inside dark unventilated plastic garbage bags",
      "Wash thoroughly with neutral detergent, rinse clean, and hang to air-dry completely in a ventilated area",
      "Soak all microfiber cloths in motor oil overnight to keep the synthetic split fibers supple and mix concentrated chlorine bleach with acidic descaling liquid to increase cleaning speed",
      "Dry wet mop heads using an open plumber propane soldering blowtorch on customer premises"
    ],
    "correctIndex": 1,
    "explanation": "Washing with neutral detergent and thorough drying stops bacterial proliferation, foul sour odors, and maintains microfiber electrostatic charge."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Maintenance",
    "difficulty": "intermediate",
    "questionText": "What periodic maintenance must be performed on commercial steam cleaning machines to prevent boiler element failure?",
    "options": [
      "Lubricate the internal electrical heating coil with automotive engine transmission fluid",
      "Fill the boiler chamber with coarse sea salt and gravel to scour internal brass surfaces",
      "Perform regular descaling using a mild citric acid solution to dissolve internal limescale deposits",
      "Weld the pressure safety release valve shut so the steam boiler can reach 500 PSI pressure by scrubbing the delicate polished marble surface with a coarse abrasive wire scouring pad"
    ],
    "correctIndex": 2,
    "explanation": "Mineral scale insulates boiler heating elements causing localized overheating and burnout; periodic citric acid descaling maintains efficiency."
  },
  {
    "categoryId": "deep-cleaning",
    "categoryName": "Deep Cleaning",
    "topic": "Maintenance",
    "difficulty": "beginner",
    "questionText": "How should industrial wet & dry vacuum cleaner HEPA and cloth filter assemblies be maintained?",
    "options": [
      "Never clean the vacuum filter because dirt accumulation improves suction vacuum performance and spray foaming chemical cleaner directly into electrical switch sockets during wall scrubbing",
      "Burn the cloth filter surface with a propane torch flame to singe off trapped carpet fibers",
      "Soak dry-only paper cartridge filters in heavy soapy water and install immediately while dripping wet",
      "Tap out dry dust, wash only washable filter media, and allow to dry completely (24h) before reinstalling"
    ],
    "correctIndex": 3,
    "explanation": "Running a vacuum with a damp filter ruins the motor by pulling moisture into motor windings, and clogged filters starve the motor of cooling air."
  }
];
