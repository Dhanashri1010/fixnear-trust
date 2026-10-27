// ===================================================================
// FixNear Trust - Question Bank Seed Data
// Practical, safety-focused, simple language test questions
// Minimum 15 questions per category (6 categories = 90 questions total)
// ===================================================================

export const QUESTION_BANK_SEED = [
  // ===================================================================
  // 1. Air Conditioning (ac-cooling) - 15 questions
  // ===================================================================
  {
    categoryId: "ac-cooling",
    question: "What is the very first safety step before opening the electrical cover of an AC outdoor unit?",
    options: [
      "Spray water to cool down the compressor",
      "Switch off the main MCB power supply and verify zero voltage",
      "Directly unscrew the capacitor terminals with bare hands",
      "Check refrigerant pressure with a manifold gauge"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Always disconnect power at the main MCB to prevent fatal electrical shocks from live terminals or charged capacitors."
  },
  {
    categoryId: "ac-cooling",
    question: "If an AC indoor unit is leaking water inside the customer's room, what is the most common cause?",
    options: [
      "Refrigerant gas is overcharged",
      "The drain pipe or drip tray is clogged with slime and algae",
      "The blower motor is rotating too fast",
      "The copper pipe diameter is too wide"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Dust and bio-slime commonly block the condensate drain line, causing condensation to overflow inside."
  },
  {
    categoryId: "ac-cooling",
    question: "Why must you discharge a dual-run AC capacitor with a 20k ohm resistor or insulated tool before touching it?",
    options: [
      "To measure the oil level inside the capacitor",
      "To prevent dangerous electrical shocks from residual stored charge",
      "To make the capacitor charge up faster",
      "To test if the fan motor turns smoothly"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Capacitors store high voltage even when the AC unit is disconnected from the main power."
  },
  {
    categoryId: "ac-cooling",
    question: "Which refrigerant is mildly flammable (A2L safety group) and requires avoiding open flames or spark sources during servicing?",
    options: [
      "R-22",
      "R-32",
      "R-410A",
      "Water vapor"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "R-32 is classified as A2L (mildly flammable); never smoke or use open flames nearby during recovery or charging."
  },
  {
    categoryId: "ac-cooling",
    question: "Before charging refrigerant into an empty split AC system, what crucial step must be performed using a vacuum pump?",
    options: [
      "Vacuum down to 500 microns to remove air and moisture",
      "Blow compressed air into the pipes",
      "Flush the coils with soapy tap water",
      "Heat the outdoor unit with a blowtorch"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "Deep evacuation down to 500 microns removes non-condensable air and moisture that form acid inside compressors."
  },
  {
    categoryId: "ac-cooling",
    question: "What does thick ice formation across the indoor evaporator coil usually indicate?",
    options: [
      "The AC is running at maximum optimal efficiency",
      "Clogged air filters or low refrigerant causing sub-zero coil temperature",
      "The room temperature is set too high",
      "The remote control battery is dead"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Restricted airflow from dirty filters or low refrigerant pressure lowers evaporating temperature below 0°C, causing ice buildup."
  },
  {
    categoryId: "ac-cooling",
    question: "Which tool should be used to detect micro-leaks in copper flare connections safely and reliably?",
    options: [
      "A cigarette lighter or matchstick flame",
      "Liquid leak detection soap bubble solution or electronic halogen sniffer",
      "Listening closely with bare ears",
      "Touching the copper joint with bare fingers"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Approved soapy bubble solution or electronic sniffer is safe and non-hazardous on all refrigerant types."
  },
  {
    categoryId: "ac-cooling",
    question: "When pressure testing newly installed copper lines for leaks, which gas MUST be used?",
    options: [
      "Pure Oxygen gas",
      "Dry Nitrogen gas (OFDN)",
      "LPG cooking gas",
      "Acetylene gas"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Never use oxygen or air as they can explode when mixed with compressor oil under pressure. Dry Nitrogen is inert and safe."
  },
  {
    categoryId: "ac-cooling",
    question: "When jet cleaning the indoor cooling coil, why must a waterproof service bag and electrical cover wrap be used?",
    options: [
      "To prevent water from ruining the customer's wall paint and short-circuiting the PCB board",
      "To keep the water warm while cleaning",
      "To hide the dirt from the customer",
      "To make the water pressure stronger"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Water contact on the PCB board or indoor wall causes permanent electronic damage and costly property repairs."
  },
  {
    categoryId: "ac-cooling",
    question: "What does an inverter AC do differently from a traditional non-inverter fixed-speed AC?",
    options: [
      "It only works on battery power",
      "Its compressor variable frequency drive adjusts speed continuously based on cooling load",
      "It cannot cool a room below 26 degrees",
      "It does not use any refrigerant gas"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Inverter ACs use variable-frequency motor drives to modulate compressor RPM smoothly rather than cycling on/off repeatedly."
  },
  {
    categoryId: "ac-cooling",
    question: "If a clamp meter shows a 1.5-ton AC drawing 14 Amperes when its nameplate says 6.5 Amperes, what is the probable fault?",
    options: [
      "The fan motor is spinning in reverse",
      "Compressor mechanical seizure, high head pressure, or failing capacitor",
      "Normal normal startup variation",
      "The remote sensor has low battery"
    ],
    correctIndex: 1,
    difficulty: "hard",
    explanation: "High current draw above rated full load amps points to mechanical rotor lock, electrical winding failure, or blocked condenser heat dissipation."
  },
  {
    categoryId: "ac-cooling",
    question: "When flaring soft copper tubing for an R-410A system, why is a specialized eccentric cone flaring tool required?",
    options: [
      "To make the flare uneven so gas slips through",
      "To create a smooth, crack-free 45-degree flare that withstands high operating pressures (400+ PSI)",
      "To make the copper pipe shorter",
      "To melt the copper together without nuts"
    ],
    correctIndex: 1,
    difficulty: "hard",
    explanation: "High operating pressures of modern refrigerants cause rough or split flares to burst or leak gas."
  },
  {
    categoryId: "ac-cooling",
    question: "Why should you never braze copper joints without purging low-pressure dry nitrogen through the pipe?",
    options: [
      "Nitrogen cools down the torch",
      "Without nitrogen, black cupric oxide scale flakes off inside and blocks the expansion valve/capillary tube",
      "Nitrogen makes the copper change color to green",
      "It makes the braze joint look shiny to the customer"
    ],
    correctIndex: 1,
    difficulty: "hard",
    explanation: "Oxidation inside un-purged copper creates black soot that destroys compressor valves and plugs capillaries."
  },
  {
    categoryId: "ac-cooling",
    question: "What Personal Protective Equipment (PPE) is strictly required when handling liquid refrigerant?",
    options: [
      "Safety goggles/face shield and insulated cryogenic gloves to avoid frostbite burns",
      "Cotton sneakers and cloth wristbands",
      "Sunglasses and plastic apron only",
      "No protection is needed for refrigerant"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Liquid refrigerant boils at sub-zero temperatures and can cause instant permanent blindness or skin frostbite on contact."
  },
  {
    categoryId: "ac-cooling",
    question: "After completing an AC master service, what should the temperature difference between the return air grill and the supply air vent be?",
    options: [
      "0°C to 2°C",
      "8°C to 12°C (typically 10°C or higher across the coil)",
      "35°C to 45°C",
      "Return and supply temperatures must be identical"
    ],
    correctIndex: 1,
    difficulty: "hard",
    explanation: "A healthy cooling coil produces an 8°C - 12°C delta-T between ambient return air and conditioned discharge air."
  },

  // ===================================================================
  // 2. Plumbing Systems (plumbing) - 15 questions
  // ===================================================================
  {
    categoryId: "plumbing",
    question: "Before dismantling any angle valve or mixer tap in a customer's bathroom, what must you do first?",
    options: [
      "Turn on the geyser at full heat",
      "Shut off the main bathroom water supply stopcock or overhead tank valve",
      "Crack open the waste pipe with a hammer",
      "Pour boiling water into the washbasin"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Always isolate the water supply stopcock first to avoid flooding the customer's property."
  },
  {
    categoryId: "plumbing",
    question: "What is the primary function of a P-trap or S-trap under kitchen sinks and washbasins?",
    options: [
      "To hold water that acts as an airtight seal against hazardous sewer gases and foul smells",
      "To slow down the water flow so bills are lower",
      "To catch coins and gold jewelry accidentally dropped",
      "To make the plumbing look modern"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "The water barrier trapped in the bend blocks poisonous sewer methane and stench from entering living spaces."
  },
  {
    categoryId: "plumbing",
    question: "When applying Teflon (PTFE) thread seal tape onto male pipe fittings, in which direction should you wrap the tape?",
    options: [
      "In the opposite direction of the tightening thread",
      "Clockwise in the direction of the tightening thread",
      "Any direction does not matter",
      "Only wrap the middle of the pipe, not the threads"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Wrapping clockwise ensures the tape tightens into the female threads rather than unraveling and bunching up."
  },
  {
    categoryId: "plumbing",
    question: "Why should CPVC and UPVC pipes NOT be joined using the exact same generic adhesive solvent cement?",
    options: [
      "CPVC solvent cement is formulated chemically for higher operating temperatures and pressures",
      "UPVC pipes are always blue and CPVC pipes are always black",
      "They are identical and any glue works",
      "Adhesive should never be used on plastic pipes"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "CPVC handles hot pressurized water and requires specialized ASTM F493 solvent cement to chemically fuse the plastic."
  },
  {
    categoryId: "plumbing",
    question: "What is 'water hammer' in domestic piping, and how is it usually cured?",
    options: [
      "A hammer used by plumbers to tap pipes",
      "A loud banging noise caused by sudden valve closure, solved by installing water hammer arrestors",
      "Water freezing inside pipes during winter",
      "A defective water meter spinning backwards"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "High velocity water shockwaves bang against pipes when fast valves close; cushion chambers or arrestors absorb this energy."
  },
  {
    categoryId: "plumbing",
    question: "When unclogging a kitchen sink drain with a motorized drain snake, why should you wear heavy-duty leather or rubber gloves?",
    options: [
      "To keep your hands clean only",
      "To prevent the spinning high-torque steel cable from grabbing cloth or breaking fingers if it binds",
      "To make the snake cable spin faster",
      "Gloves are not recommended for drain snakes"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Rotating coiled cables can snatch loose cloth or twist violently if they hit tree roots or solid blockages."
  },
  {
    categoryId: "plumbing",
    question: "What happens if a Pressure Relief Valve (PRV) on a 25-liter electric storage geyser gets permanently plugged or capped off?",
    options: [
      "Water heats up twice as fast",
      "The internal tank can explode due to dangerous steam and hydraulic pressure buildup",
      "Electricity consumption drops by 50%",
      "The water becomes softer and cleaner"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "PRVs are critical safety lifelines. Blocking a geyser relief valve creates a catastrophic steam boiler explosion hazard."
  },
  {
    categoryId: "plumbing",
    question: "What is the recommended slope (gradient) for horizontal domestic waste drainage pipes (e.g., 75mm or 110mm PVC)?",
    options: [
      "1 in 40 to 1 in 50 (approx 2% slope)",
      "Zero slope (completely flat horizontal)",
      "Straight vertical 90-degree drop only",
      "1 in 5 steep slope"
    ],
    correctIndex: 0,
    difficulty: "hard",
    explanation: "A 1:40 to 1:50 slope allows liquids and solids to wash down together without liquids outrunning solids and leaving blockages."
  },
  {
    categoryId: "plumbing",
    question: "What type of pipe jointing technique is used for PPR (Polypropylene Random Copolymer) hot and cold water pipes?",
    options: [
      "Threaded brass coupling with hemp only",
      "Heat socket fusion welding with a controlled thermostatic welding machine (260°C)",
      "Superglue or instant cyanoacrylate",
      "Duct tape and wire binding"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "PPR requires heating pipe and fitting simultaneously to 260°C and fusing them into one continuous molecular bond."
  },
  {
    categoryId: "plumbing",
    question: "If water continues trickling into a toilet commode bowl continuously, what is the most likely defective part inside the flush tank?",
    options: [
      "The ceramic flush handle",
      "A deteriorated flush valve silicone flapper/washer or faulty ballcock float valve",
      "The waste outlet bend",
      "The bathroom mirror"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "A worn flush seal or misadjusted float valve allows reservoir water to overflow into the bowl constantly."
  },
  {
    categoryId: "plumbing",
    question: "Why should acid cleaners NEVER be poured into modern chrome-plated brass bathroom faucets?",
    options: [
      "Acid strips away the nickel-chrome electroplating, permanently staining and pitting the metal",
      "It makes the water taste sweet",
      "Acid will increase the water pressure too high",
      "Chrome loves acid and becomes shinier"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Strong hydrochloric acids react violently with electroplated brass, turning expensive luxury fittings black."
  },
  {
    categoryId: "plumbing",
    question: "When installing a concealed bathroom diverter valve, why is a pressure test with a test plug mandatory before tiling?",
    options: [
      "To check if the tiles match the wall color",
      "To verify zero joint leaks under 10 bar pressure before walls are permanently sealed with concrete and tile",
      "To remove all air from the apartment building",
      "It is an optional step that can be skipped"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Concealed leaks behind tiles cause catastrophic structural dampness and require expensive demolition to rectify."
  },
  {
    categoryId: "plumbing",
    question: "What does an anti-siphon valve or vacuum breaker do in a domestic plumbing connection?",
    options: [
      "Stops dirty contaminated water from being sucked back into the clean drinking water supply during pressure drop",
      "Makes garden hose spray further",
      "Increases hot water temperature",
      "Filters sand from borewell water"
    ],
    correctIndex: 0,
    difficulty: "hard",
    explanation: "Backflow preventers protect clean potable water from contamination during negative mains pressure."
  },
  {
    categoryId: "plumbing",
    question: "Which wrench is specifically designed to tighten or loosen deep, recessed backnuts behind washbasins and sinks?",
    options: [
      "Heavy pipe wrench",
      "Basin wrench (crowfoot wrench with swiveling spring jaw)",
      "Hacksaw frame",
      "Lineman's pliers"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "A basin wrench has a long shaft and pivoting jaw designed specifically for cramped spaces beneath sinks."
  },
  {
    categoryId: "plumbing",
    question: "If a customer complains that their top-floor shower head has very low pressure compared to the ground floor, what is the best remedy?",
    options: [
      "Drill bigger holes in the shower rose",
      "Install an automatic in-line pressure booster pump or raise overhead tank height",
      "Use smaller diameter pipes everywhere",
      "Tell the customer to shower on the ground floor"
    ],
    correctIndex: 1,
    difficulty: "hard",
    explanation: "Static head pressure is proportional to tank elevation; top floors have low head and require an automatic inline booster pump."
  },

  // ===================================================================
  // 3. Electrical & Safety (electrical) - 15 questions
  // ===================================================================
  {
    categoryId: "electrical",
    question: "Before performing any wiring or switchboard repair, what is the primary rule for personal safety?",
    options: [
      "Work quickly while holding an umbrella",
      "Switch off the main MCB/isolator, lock out/tag out, and verify dead circuit with a rated multimeter or tester",
      "Touch the neutral wire with a wet finger to test",
      "Wear metal jewelry for grounding"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "De-energizing at source and verifying with a calibrated tester is the cardinal rule of electrical work."
  },
  {
    categoryId: "electrical",
    question: "What is the primary role of an RCCB (Residual Current Circuit Breaker) or ELCB in a domestic distribution board?",
    options: [
      "To measure electricity bill units",
      "To instantly trip (within 30ms) when a small leakage current (30mA) goes to ground, saving human lives from electrocution",
      "To increase ceiling fan speed",
      "To protect against thunder without earthing"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "RCCBs detect tiny current imbalances caused by shock to earth and trip fast enough to prevent ventricular fibrillation."
  },
  {
    categoryId: "electrical",
    question: "Under standard Indian electrical wiring code (IS 732), what are the standard phase, neutral, and earth conductor colors?",
    options: [
      "Phase: Red/Yellow/Blue, Neutral: Black, Earth: Green or Green-Yellow",
      "Phase: Green, Neutral: Red, Earth: Black",
      "All wires should be white",
      "Phase: Blue, Neutral: Green, Earth: Red"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "IS 732 mandates Red/Yellow/Blue for live phases, Black for neutral, and Green/Yellow for protective earth."
  },
  {
    categoryId: "electrical",
    question: "Why should you never replace a blown 16A MCB with a 32A MCB simply because it keeps tripping on load?",
    options: [
      "A 32A MCB will not fit on DIN rail",
      "The underlying wires will overheat, melt their PVC insulation, and start a fire inside the walls",
      "The electricity board will fine the customer",
      "The switchboard will turn off permanently"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "MCBs are sized to protect the wire gauge. Over-sizing the breaker removes fire protection and turns wiring into heating elements."
  },
  {
    categoryId: "electrical",
    question: "What does an Earth Resistance Tester measure, and what is the ideal maximum earth pit resistance for residential homes?",
    options: [
      "Measures water moisture, ideal is 100 ohms",
      "Measures resistance of earthing electrode to true earth, ideally below 2 to 5 ohms",
      "Measures sunlight intensity",
      "Measures copper wire length"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Low earth resistance (below 5 ohms) ensures fault currents quickly trip breakers rather than electrocuting appliance users."
  },
  {
    categoryId: "electrical",
    question: "Why should electrical screwdrivers and pliers used by technicians be VDE certified for 1000V insulation?",
    options: [
      "They look more professional in the toolbox",
      "They protect the technician's hands from deadly arc flash and shock if live parts are accidentally touched",
      "They never rust even in salt water",
      "They are lighter to carry"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "VDE tested tools undergo rigorous 10,000V dielectric tests to guarantee technician protection up to 1000V AC."
  },
  {
    categoryId: "electrical",
    question: "When connecting a 3-pin 16A wall socket, where must the thicker top pin be connected?",
    options: [
      "To the Live Phase wire",
      "To the Protective Earth (Ground) wire",
      "To the Neutral wire",
      "Leave it unconnected"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "The larger top pin is always dedicated to Protective Earthing; its longer pin connects first and disconnects last for safety."
  },
  {
    categoryId: "electrical",
    question: "What is the recommended wire gauge (cross-sectional area) for a dedicated 1.5-ton AC or 2000W geyser power circuit?",
    options: [
      "0.5 sq mm copper wire",
      "At least 4.0 sq mm (or minimum 2.5 sq mm) FRLS copper wire",
      "Any thin iron telephone wire",
      "Bare aluminum wire without sheath"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Heavy inductive and resistive heating loads require minimum 2.5 sq mm to 4 sq mm copper to carry 10-16A continuously without heating."
  },
  {
    categoryId: "electrical",
    question: "What does 'FRLS' stand for on high-grade electrical wiring cables?",
    options: [
      "Fast Running Long Spark",
      "Flame Retardant Low Smoke",
      "Flexible Rubber Line Shield",
      "Frequent Resistance Low Size"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "FRLS cables resist combustion and emit minimal toxic fumes, allowing occupants to escape safely during house fires."
  },
  {
    categoryId: "electrical",
    question: "Why is a loose wire connection inside a high-power switchboard dangerous?",
    options: [
      "It causes localized high contact resistance, leading to severe overheating, arcing, and electrical fires",
      "It makes the light bulbs too bright",
      "It turns AC current into DC current",
      "It increases the inverter battery capacity"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "Loose screws create high resistance hotspots (Joule heating P = I²R) that easily ignite surrounding plastic."
  },
  {
    categoryId: "electrical",
    question: "Which fire extinguisher rating MUST be used for extinguishing an energized electrical fire?",
    options: [
      "Class A pressurized water extinguisher",
      "Class C / CO2 (Carbon Dioxide) or Dry Chemical Powder (DCP) extinguisher",
      "A bucket of soapy water",
      "Blowing air with a ceiling fan"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Never use water on live electrical fires as water conducts electricity and will electrocute the operator. Use CO2 or dry powder."
  },
  {
    categoryId: "electrical",
    question: "What is a BLDC ceiling fan and what is its main advantage over a traditional induction motor fan?",
    options: [
      "It runs on car diesel fuel",
      "Brushless DC motor consuming 60% less electricity (28W vs 75W) with smooth speed control",
      "It does not require blades",
      "It only turns on when someone claps"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "BLDC motors use electronic commutation and permanent magnets, saving up to 60% power while generating zero motor hum."
  },
  {
    categoryId: "electrical",
    question: "If a customer's neutral wire is broken at the main pole, what bizarre symptom often occurs in 3-phase domestic loads?",
    options: [
      "All appliances run at half speed",
      "Phase-to-neutral voltage floats wildly between 100V and 400V, burning out connected electronics",
      "The electricity bill becomes zero",
      "Nothing happens because neutral is not needed"
    ],
    correctIndex: 1,
    difficulty: "hard",
    explanation: "A floating neutral causes unbalanced phase voltages to swing up to line-to-line 400V, instantly frying household appliances."
  },
  {
    categoryId: "electrical",
    question: "What is the difference between a Type B and Type C MCB curve?",
    options: [
      "Type B trips at 3-5x rated current (good for resistive loads); Type C trips at 5-10x rated current (handles inductive motor inrush)",
      "Type B is for commercial factories; Type C is for toy cars",
      "There is no difference",
      "Type B has no switch handle"
    ],
    correctIndex: 0,
    difficulty: "hard",
    explanation: "Type C curves tolerate the brief 5-10x surge currents of compressors and motors without false nuisance tripping."
  },
  {
    categoryId: "electrical",
    question: "When testing a circuit with a True-RMS digital multimeter, what setting must you select to check continuity across a fuse?",
    options: [
      "High AC Voltage range (600V)",
      "Continuity beeper mode / low Ohms (sound beeps if path is complete under 30 ohms)",
      "DC Amps mode",
      "Capacitance microfarad mode"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "The continuity beeper allows instant audible confirmation of an unbroken circuit or blown fuse element."
  },

  // ===================================================================
  // 4. Home Appliances (appliances) - 15 questions
  // ===================================================================
  {
    categoryId: "appliances",
    question: "Why must a microwave oven's high-voltage capacitor NEVER be handled without safe discharging, even when unplugged?",
    options: [
      "It will leak liquid oil onto the floor",
      "It holds lethal voltage (2,000V - 4,000V DC) that can kill instantly on touch",
      "It will erase the microwave clock memory",
      "It will crack the glass turntable"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Microwave high-voltage capacitors store up to 4,000V at high current, posing one of the most fatal hazards in appliance repair."
  },
  {
    categoryId: "appliances",
    question: "In a fully automatic front-load washing machine, what is the most common cause of loud thumping and violent shaking during high-speed spin cycle?",
    options: [
      "Worn drum suspension springs/hydraulic dampers or degraded rear drum spider bearings",
      "The detergent soap is too scented",
      "The inlet water tap is closed",
      "The power cord is too long"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "Suspension dampers absorb centrifugal vibrations; when worn, the heavy drum hits the casing violently."
  },
  {
    categoryId: "appliances",
    question: "What does error code 'E1' or '4E' typically indicate on Samsung and LG washing machines?",
    options: [
      "Motor has burned out",
      "Water inlet fault (water tap turned off, clogged mesh filter, or defective inlet solenoid valve)",
      "Door lock is jammed",
      "Lid is open"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Water inlet errors happen when the machine fails to fill to the designated water level within timed threshold."
  },
  {
    categoryId: "appliances",
    question: "In a domestic frost-free double door refrigerator, if the freezer is freezing ice but the lower food compartment is warm, what is the most probable fault?",
    options: [
      "Total refrigerant gas leak",
      "Defrost heater, bimetal thermostat, or thermal fuse failed, causing ice to block the air circulation duct",
      "The interior LED bulb is too hot",
      "The door magnet is too strong"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "A defrost cycle failure allows thick frost to bridge the evaporator coils and choke the cold air duct to the fresh food zone."
  },
  {
    categoryId: "appliances",
    question: "What is the primary function of the RO (Reverse Osmosis) semi-permeable membrane in a domestic water purifier?",
    options: [
      "To add lemon flavoring to the water",
      "To filter out dissolved heavy metals, fluorides, salts, and microorganisms down to 0.0001 microns",
      "To heat the water to boiling point",
      "To make water bubbles for soda"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "RO membranes have microscopic 0.0001-micron pores that separate pure water molecules from dissolved mineral contaminants."
  },
  {
    categoryId: "appliances",
    question: "What does TDS stand for when evaluating drinking water quality from an RO purifier?",
    options: [
      "Total Dissolved Solids",
      "Top Drinking Standard",
      "Temperature Degree Scale",
      "Turbidity Density System"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "TDS stands for Total Dissolved Solids, measuring inorganic salts and organic matter dissolved in milligrams per liter (PPM)."
  },
  {
    categoryId: "appliances",
    question: "Why must you check the sediment and pre-carbon filter cartridges every 6 months in an RO water purifier?",
    options: [
      "To prevent chlorine and suspended silt from permanently fouling and damaging the expensive RO membrane",
      "Because the plastic tubes melt if not changed",
      "To change the color of the water purifier cabinet",
      "Sediment filters never need changing"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "Chlorine degrades thin-film composite (TFC) membranes and silt tears membrane sheets; carbon filters neutralize chlorine."
  },
  {
    categoryId: "appliances",
    question: "If a washing machine refuses to spin and leaves clothes soaking wet with water remaining inside the drum, what should be inspected first?",
    options: [
      "The customer's drainage pipe and coin trap / lint filter for stuck coins, bobby pins, or drain pump blockage",
      "The front glass door",
      "The user manual booklet",
      "The detergent tray slider"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Modern washers refuse to spin until water drains; coins and lint trapped in the impeller pump filter are the #1 cause."
  },
  {
    categoryId: "appliances",
    question: "How can a technician check if a refrigerator compressor's inverter PCB or motor windings are good using a multimeter?",
    options: [
      "Measure winding resistance across U, V, W terminals (all 3 phase terminal pairs must show identical low resistance around 6-12 ohms)",
      "Smell the copper pipes",
      "Tap the compressor body with a heavy wrench",
      "Put ice on the terminals"
    ],
    correctIndex: 0,
    difficulty: "hard",
    explanation: "3-phase BLDC inverter compressors require balanced winding resistance across all 3 phases (U-V, V-W, W-U) with infinity to earth."
  },
  {
    categoryId: "appliances",
    question: "In an induction cooktop, what component generates the high-frequency oscillating magnetic field that heats cookware?",
    options: [
      "An open gas burner flame",
      "A flat copper induction coil driven by IGBT switching transistors",
      "A quartz heating rod",
      "A halogen light bulb"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "High-frequency currents (20-35 kHz) driven by IGBTs through copper coils induce eddy currents inside ferromagnetic pan bases."
  },
  {
    categoryId: "appliances",
    question: "Why should only OEM (Original Equipment Manufacturer) certified spare parts be installed in major appliances?",
    options: [
      "OEM parts guarantee exact voltage ratings, thermal tolerance, safety compliance, and preserve the 30-day FixNear warranty",
      "Because counterfeit parts are always painted bright red",
      "OEM parts are strictly illegal to sell",
      "It does not matter what part is installed"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Cheap counterfeit spares frequently lack thermal fuses, burn out prematurely, and void customer safety insurance."
  },
  {
    categoryId: "appliances",
    question: "What causes a microwave oven to produce loud sparking and crackling sounds inside the cooking cavity?",
    options: [
      "A burnt or grease-soaked mica waveguide cover plate, or metal foil placed inside",
      "Too much salt on the food",
      "Low water pressure in the sink",
      "The turntable rotating clockwise"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "Carbonized food residue on the mica waveguide sheet absorbs RF energy and carbonizes into an electrical arc."
  },
  {
    categoryId: "appliances",
    question: "If an electric storage water geyser water is scalding boiling hot and steaming from the taps, what component has failed?",
    options: [
      "The heating element is too clean",
      "The primary adjustable stem thermostat has welded closed (safety thermal cutout should trip)",
      "The cold water pipe is too thick",
      "The water tank is upside down"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Thermostats must cut power at set temperature (65°C); if contacts fuse closed, the secondary thermal cutout must intervene."
  },
  {
    categoryId: "appliances",
    question: "When troubleshooting an automatic dishwasher that is not cleaning plates properly, what simple component is often clogged with lime scale?",
    options: [
      "Rotating spray arm water jets and bottom micro-mesh food filter",
      "The front handle latch",
      "The rinse aid cap color",
      "The cutlery basket wheels"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Hard water deposits and food seeds clog the small spray nozzle apertures, reducing water spray pressure."
  },
  {
    categoryId: "appliances",
    question: "What tool must a technician use to verify that an appliance metal cabinet is not leaking dangerous stray voltage to the customer?",
    options: [
      "A digital multimeter set to AC Volts between metal chassis and reliable earth ground (must read 0V)",
      "Touch the cabinet with the back of the palm",
      "Spray soapy water on the frame",
      "No tool is needed"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Verifying zero chassis potential with a meter ensures the earth conductor is intact and the user is 100% safe from shock."
  },

  // ===================================================================
  // 5. Carpentry & Fitting (carpentry) - 15 questions
  // ===================================================================
  {
    categoryId: "carpentry",
    question: "When mounting a heavy wooden wall cabinet or LED TV unit onto a brick or concrete wall, what fastener must be used?",
    options: [
      "Small 1-inch wire nails hammered directly",
      "Appropriate PVC/nylon wall expansion plugs (rawl plugs) or metal anchor bolts with high-shear screws",
      "Double-sided foam tape only",
      "Toothpicks and craft glue"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Heavy hanging loads require nylon anchors or expansion bolts that expand inside masonry to resist pull-out forces."
  },
  {
    categoryId: "carpentry",
    question: "What is the primary function of a spirit level when installing doors, shelves, or kitchen modular cabinets?",
    options: [
      "To measure the moisture percentage in wood",
      "To ensure surfaces are perfectly horizontal (level) and vertical (plumb) using the centered bubble vial",
      "To check how old the wood is",
      "To smooth rough wooden edges"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Spirit levels ensure plumb and level alignment so doors swing freely without binding and shelves do not tilt."
  },
  {
    categoryId: "carpentry",
    question: "When drilling holes for installing European-style concealed hinges (cup hinges) on modular wardrobe shutters, what specific bit is needed?",
    options: [
      "Small masonry drill bit",
      "35mm Forstner bit that cuts a flat-bottomed circular pocket",
      "Metal twist bit",
      "Hacksaw blade"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Concealed Euro-hinges seat in standard 35mm diameter round, flat-bottomed bore pockets cut by a Forstner bit."
  },
  {
    categoryId: "carpentry",
    question: "Why should you always pre-drill a pilot hole before driving screws into seasoned hardwood or near the edge of plywood?",
    options: [
      "To make the screw longer",
      "To prevent the wood from splitting along the grain from lateral wedge pressure",
      "To allow termites to enter",
      "Because screws cannot enter wood otherwise"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Pilot holes displace wood fibers ahead of time, preventing irreversible splits on decorative edges."
  },
  {
    categoryId: "carpentry",
    question: "What type of wood adhesive is standard for interior furniture joinery under Indian climate conditions?",
    options: [
      "PVA (Polyvinyl Acetate) synthetic resin wood adhesive (e.g. Fevicol SH / Marine grade D3)",
      "Flour paste",
      "Hot glue gun sticks",
      "Chewing gum"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "D3 water-resistant PVA synthetic resin forms bonds stronger than the wood fibers themselves when clamped."
  },
  {
    categoryId: "carpentry",
    question: "If a wooden door sticks and rubs against the floor or frame during monsoon season, what is the cause?",
    options: [
      "The door lock became magnetic",
      "Natural wood fibers absorbed atmospheric moisture and expanded (hygroscopic swelling)",
      "The floor concrete rose up",
      "The hinges melted"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Timber expands when relative humidity rises; shaving clearance gaps with a hand planer cures binding."
  },
  {
    categoryId: "carpentry",
    question: "What Personal Protective Equipment (PPE) should be worn when operating a high-speed plunge router or circular saw?",
    options: [
      "Safety goggles/face shield, dust mask (N95), and hearing ear defenders (no loose clothing)",
      "Loose woolen muffler and loose necktie",
      "Bare feet and reading glasses",
      "No protection is needed"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "High-speed blades throw wood splinters and airborne dust; loose clothing must be avoided to prevent entanglement."
  },
  {
    categoryId: "carpentry",
    question: "What is the difference between MDF (Medium Density Fiberboard) and BWR (Boiling Water Resistant) Plywood?",
    options: [
      "MDF swells and crumbles if exposed to moisture; BWR plywood uses phenol formaldehyde resin to resist water exposure",
      "MDF is made of metal; BWR is made of glass",
      "There is no difference between them",
      "MDF is only used for outdoor fencing"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "BWR ply is cross-laminated timber veneers bonded with waterproof phenolic resin, making it ideal for wet kitchens."
  },
  {
    categoryId: "carpentry",
    question: "When fitting a high-security mortise door lock, which tool is traditionally used to chisel out the internal lock cavity in the wooden door stile?",
    options: [
      "Screwdriver bit",
      "Wood chisel (mortise chisel) and wooden mallet with an auger/spade drill bit",
      "Rubber hammer only",
      "Pipe wrench"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Boring holes with a spade bit and squaring off clean sidewalls with a sharp mortise chisel creates the lock pocket."
  },
  {
    categoryId: "carpentry",
    question: "What is edge banding on modular furniture, and why is PVC edge tape applied?",
    options: [
      "To seal porous raw plywood/particleboard edges from moisture ingress and provide an aesthetic finished border",
      "To make furniture heavier",
      "To prevent customers from moving furniture",
      "To hide gold inside the table"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Edge banding seals exposed inner cores against moisture absorption and prevents splinter scratches."
  },
  {
    categoryId: "carpentry",
    question: "If a drawer slide (telescopic channel) is jamming and sticking, what should you inspect first?",
    options: [
      "Check if cabinet box is square, tracks are parallel, and ball bearing channels are free of sawdust and lubricated with silicone spray",
      "Replace the entire wardrobe",
      "Hammer the drawer with force",
      "Cut the drawer shorter with a handsaw"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "Telescopic ball-bearing slides require precise parallel alignment (usually 12.7mm clearance per side) and clean tracks."
  },
  {
    categoryId: "carpentry",
    question: "When installing soft-close hydraulic kitchen cabinet hinges, what adjustment screw controls the horizontal left-right gap between doors?",
    options: [
      "The center side-adjustment cam screw on the hinge arm",
      "The mounting plate screws on the carcass",
      "The door handle screw",
      "The wall anchor"
    ],
    correctIndex: 0,
    difficulty: "hard",
    explanation: "3-way adjustable hinges have dedicated screws for horizontal shift, vertical height, and in-out depth."
  },
  {
    categoryId: "carpentry",
    question: "Why should you never use drywall screws (black gypsum screws) for mounting heavy load-bearing timber joints or door hinges?",
    options: [
      "Drywall screws are brittle and snap easily under shear stress; zinc-coated wood screws have high shear ductility",
      "They are too expensive",
      "They have no threads",
      "They only come in blue color"
    ],
    correctIndex: 0,
    difficulty: "hard",
    explanation: "Drywall screws are hardened and brittle; dynamic door movement snaps heads off under shear load."
  },
  {
    categoryId: "carpentry",
    question: "What is the purpose of countersinking a screw hole in wood?",
    options: [
      "To allow the flat head of the screw to sit flush or slightly below the surface of the timber",
      "To make the hole oval",
      "To let air inside the screw",
      "To paint the screw green"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Countersinking creates a conical recess so screw heads sit smooth and flush with the timber surface."
  },
  {
    categoryId: "carpentry",
    question: "Before driving wall anchors into a customer's wall to hang a shelf, what safety tool should be used to scan the wall?",
    options: [
      "A handheld electronic wall scanner / stud detector to locate concealed live electrical cables and water pipes",
      "A magnifying glass",
      "Tapping with a steel coin only",
      "No check is necessary"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Wall scanners prevent catastrophic accidents like drilling into live 230V conduits or punctured water pipes."
  },

  // ===================================================================
  // 6. Deep Cleaning (deep-cleaning) - 15 questions
  // ===================================================================
  {
    categoryId: "deep-cleaning",
    question: "Why must you NEVER mix Bleach (Sodium Hypochlorite) with Toilet Cleaners containing Hydrochloric Acid or Ammonia?",
    options: [
      "It makes the solution smell like oranges",
      "It instantly produces lethal, poisonous Chloramine/Chlorine gas that can burn lungs and cause death",
      "It turns the water pink",
      "It creates clean bubbles only"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Mixing acid with bleach creates toxic chlorine gas that causes fatal pulmonary edema and asphyxiation."
  },
  {
    categoryId: "deep-cleaning",
    question: "When deep cleaning a commercial or domestic kitchen chimney/exhaust hood, what chemical is most effective for breaking down heavy polymerized grease?",
    options: [
      "Plain cold tap water",
      "Alkaline degreaser solution / caustic soda dip for stainless steel baffle filters",
      "Vinegar diluted 100 times",
      "Kerosene mixed with petrol"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Heavy burnt oil and polymerized fats require warm alkaline solutions to saponify and dissolve grease bonds."
  },
  {
    categoryId: "deep-cleaning",
    question: "Why should strong acidic descalers NEVER be used on Italian marble, granite, or Kota stone floors?",
    options: [
      "Acid reacts immediately with the calcium carbonate in natural stone, causing irreversible chemical etching, dull patches, and pitting",
      "Acid makes marble too slippery",
      "Acid changes the color of the walls",
      "Marble loves acid"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Marble is calcium carbonate; acid dissolves the stone instantly, permanently destroying polished luster."
  },
  {
    categoryId: "deep-cleaning",
    question: "What is the industry standard color-coding practice for microfiber cleaning cloths to prevent cross-contamination?",
    options: [
      "Red for high-risk sanitary areas (toilet commodes/urinals), Yellow for bathroom tiles/sinks, Blue for general living areas/glass",
      "Use one single cloth for both toilet and dining table",
      "All cloths must be black",
      "Color coding is only for aesthetics"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "Color coding prevents bacteria like E. coli from toilet surfaces from being wiped onto food preparation counters."
  },
  {
    categoryId: "deep-cleaning",
    question: "What Personal Protective Equipment (PPE) is strictly required when applying concentrated cleaning chemicals or scrubbing grout?",
    options: [
      "Chemical-resistant nitrile/rubber gloves, splash safety goggles, non-slip rubber shoes, and well-ventilated mask",
      "Bare feet and cotton socks",
      "Sunglasses and wrist watch only",
      "Gloves should be avoided"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Chemical splashes cause severe skin irritation and corneal eye damage; PPE guarantees worker safety."
  },
  {
    categoryId: "deep-cleaning",
    question: "When using a motorized single-disc rotary floor scrubbing machine, what pad color is used for intense scrubbing vs buffing/polishing?",
    options: [
      "Black/Red pad for heavy scrubbing/stripping; White pad for soft buffing and polishing",
      "White for heavy scratching; Black for soft glass",
      "All pads are identical abrasive grit",
      "Rotary machines do not use pads"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "Black and brown pads have heavy abrasive grit for stripping wax/dirt; white pads have zero grit for high-gloss buffing."
  },
  {
    categoryId: "deep-cleaning",
    question: "Before steam-cleaning an upholstered sofa or fabric mattress, what preliminary test should always be carried out?",
    options: [
      "Colorfastness spot test on an inconspicuous hidden corner to check if fabric dye runs or bleeds",
      "Pour hot coffee on the cushion",
      "Cut a patch from the center",
      "No test is ever required"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Spot testing protects against expensive client claims if delicate upholstery fabrics bleed dye under heat and moisture."
  },
  {
    categoryId: "deep-cleaning",
    question: "What is the primary advantage of high-temperature dry steam cleaning (140°C+) on bathroom fixtures and tile grout?",
    options: [
      "It instantly kills 99.9% of bacteria, mold spores, and dust mites without relying heavily on harsh toxic chemicals",
      "It paints the tiles white",
      "It freezes the water pipes",
      "It replaces the need to wipe surfaces"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Thermal energy from pressurized dry steam penetrates porous grout lines, sanitizing and loosening grime eco-safely."
  },
  {
    categoryId: "deep-cleaning",
    question: "What should you do immediately if concentrated chemical cleaner splashes into your or a teammate's eyes?",
    options: [
      "Rub your eyes with hands and wait 1 hour",
      "Immediately flush eyes with clean continuous lukewarm water for at least 15 minutes and seek medical evaluation",
      "Pour hot water in the eyes",
      "Cover eyes with a dry towel and sleep"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Immediate, continuous emergency water irrigation is essential to prevent permanent chemical burning of the cornea."
  },
  {
    categoryId: "deep-cleaning",
    question: "When deep cleaning a residential kitchen, why is electrical safety isolation crucial before degreasing the hob and back-splashes?",
    options: [
      "Water, steam, or liquid degreaser entering 230V kitchen socket outlets will cause short circuits, shocks, or fire",
      "It saves 2 units of electricity",
      "The lights are too bright to see dust",
      "Appliances clean themselves when turned on"
    ],
    correctIndex: 0,
    difficulty: "easy",
    explanation: "Water spraying near kitchen countertops frequently enters plug points; sealing and isolating power is mandatory."
  },
  {
    categoryId: "deep-cleaning",
    question: "How should limescale (calcium carbonate buildup) on bathroom glass shower partitions and chrome taps be removed safely?",
    options: [
      "Using specialized mild organic acidic descaling cleaners (citric/sulfamic acid based) and non-scratch scrubbing pads",
      "Scratching with steel wool and wire brushes",
      "Using concentrated industrial battery acid",
      "Hammering the glass gently"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "Citric or sulfamic acid dissolves alkaline calcium scale without scratching tempered glass or pitting chrome plating."
  },
  {
    categoryId: "deep-cleaning",
    question: "What does 'contact time' or 'dwell time' mean in surface sanitization and disinfection?",
    options: [
      "The time it takes to walk from the door to the bathroom",
      "The duration a disinfectant must remain wet on a surface to kill targeted pathogens before being wiped off",
      "The warranty time of the mop",
      "The customer's phone call duration"
    ],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Disinfectants require designated wet contact time (usually 5 to 10 minutes) to break bacterial cell walls effectively."
  },
  {
    categoryId: "deep-cleaning",
    question: "When vacuuming deep dust from mattresses and sofas, what filter specification in the vacuum cleaner prevents fine allergens from blowing back into the room?",
    options: [
      "HEPA (High Efficiency Particulate Air) filter certified to trap 99.97% of particles down to 0.3 microns",
      "A simple paper bag with pinholes",
      "No filter is needed",
      "A wire mesh screen"
    ],
    correctIndex: 0,
    difficulty: "medium",
    explanation: "True HEPA filtration stops micro-allergens, dust mites, and pet dander from becoming airborne again."
  },
  {
    categoryId: "deep-cleaning",
    question: "Why should wet floor caution cones ('Caution: Wet Floor') always be placed during commercial corridor or lobby cleaning?",
    options: [
      "To decorate the floor",
      "To legally alert pedestrians and prevent dangerous slip-and-fall injuries on wet slick tiles",
      "To prevent cleaning staff from walking",
      "Because the mop rests on the cone"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Wet tile floors are severe slip hazards; prominent warning cones protect occupants and avoid liability."
  },
  {
    categoryId: "deep-cleaning",
    question: "After completing a deep cleaning job in a customer's home, what is the final standard operating procedure before handover?",
    options: [
      "Leave wet mops on the wooden floor and leave immediately",
      "Pack all equipment, wipe down any damp footprints, ventilate rooms, conduct joint walk-through inspection with customer",
      "Lock the customer out of the bathroom for 24 hours",
      "Dispose of chemical waste into the garden plants"
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "A joint inspection guarantees customer satisfaction, checks all areas, and maintains FixNear Trust standards."
  }
];
