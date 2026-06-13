export type Card = { q: string; a: string };
export type Deck = { id: string; code: string; name: string; cards: Card[] };

export const DECKS: Deck[] = [
  {
    id: "rest", code: "01", name: "At Rest",
    cards: [
      { q: "At a standstill, which two forces act on the bike?", a: "Gravity (weight) pulling down through the centre of gravity, and the ground's normal force pushing up through the two tyre contact patches." },
      { q: "What decides how the weight splits between the two wheels?", a: "The horizontal position of the centre of gravity — the nearer it is to a wheel, the more of the weight that wheel carries." },
      { q: "Why does a stationary bike fall over?", a: "Once a vertical line down from the centre of gravity falls outside the contact patches, gravity creates a toppling moment." },
      { q: "How does a higher centre of gravity affect balance at rest?", a: "It topples at a smaller lean angle — there's less margin before the CoG leaves the contact patch." },
      { q: "What does adding a pillion or luggage do?", a: "Raises the centre of gravity and shifts it rearward, so the bike feels top-heavy and the weight distribution changes." },
    ],
  },
  {
    id: "slow", code: "02", name: "Slow Speed & Friction Zone",
    cards: [
      { q: "What is the clutch 'friction zone'?", a: "The band of clutch-lever travel where the plates slip, feeding a controllable trickle of drive without fully engaging." },
      { q: "How do you keep balance below walking pace?", a: "Slip the clutch in the friction zone, trail a little rear brake, and steer directly — the drivetrain tension keeps the bike planted." },
      { q: "Why use the rear brake, not the front, at very low speed?", a: "The rear scrubs surplus speed smoothly and keeps the bike settled; the front brake upsets balance and can tuck the front." },
      { q: "What is the 'critical speed'?", a: "Roughly 8 km/h — below it the bike has little self-stability and you must actively balance it." },
      { q: "Why does a bike stall when pulling away?", a: "Letting the clutch out with too few revs (or in too high a gear) loads the engine below idle until it dies." },
    ],
  },
  {
    id: "steer", code: "03", name: "Steering",
    cards: [
      { q: "How do you steer a motorcycle at road speed?", a: "Countersteering — briefly push the bar the opposite way (push the right bar to go right) to make the bike lean into the turn." },
      { q: "Why does pushing the right bar make you go right?", a: "It steers the front wheel momentarily left, so the contact patches move out from under the CoG and the bike falls into a right lean." },
      { q: "Name the three forces in a turn and their roles.", a: "Gyroscopic precession starts the lean, camber thrust sustains the turn, and centripetal force + gravity keep it balanced." },
      { q: "How do you steer below walking pace?", a: "Direct steering — simply point the bars where you want to go and balance with your body." },
    ],
  },
  {
    id: "corner", code: "04", name: "Cornering",
    cards: [
      { q: "What sets the lean angle in a steady corner?", a: "Speed and corner radius: θ = arctan(v² / g·r). Faster or tighter means more lean." },
      { q: "Does tyre grip (μ) change the lean angle you need?", a: "No — lean depends only on speed and radius. Grip just sets the limit before you slide." },
      { q: "What is camber thrust?", a: "The cornering force a leaned, round-profile tyre generates as it tries to roll in a circle — a big part of your grip in a corner." },
      { q: "What is the maximum cornering speed for a given radius?", a: "v = √(μ · g · r). Lower grip (rain, cold tyres) lowers it." },
      { q: "Why hold one smooth lean through a corner?", a: "A single steady lean uses the available grip most efficiently; mid-corner inputs eat into the grip budget." },
    ],
  },
  {
    id: "brake", code: "05", name: "Braking",
    cards: [
      { q: "Which way does weight transfer under braking?", a: "Forward — the forks dive and the front tyre is pressed down harder while the rear goes light." },
      { q: "Why does the front brake do most of the work?", a: "Weight transfer loads the front tyre, giving it the most grip; the rear is light and has little." },
      { q: "Why squeeze the front brake progressively?", a: "To let weight transfer load the front before you ask for peak grip — grab it and it can lock before it's loaded." },
      { q: "Why does the rear lock so easily in hard braking?", a: "As weight shifts forward the rear goes light, so even a small brake input exceeds its grip." },
      { q: "Roughly the maximum deceleration on dry tarmac?", a: "About 0.9–1.0 g." },
    ],
  },
  {
    id: "throttle", code: "06", name: "Throttle & Traction",
    cards: [
      { q: "Which way does weight transfer on the throttle?", a: "Rearward — the rear squats and grips harder, the front lightens (less steering feel)." },
      { q: "What causes a wheelie?", a: "Acceleration high enough that the front load reaches zero — when a > g·(b/h)." },
      { q: "How do CoG height and wheelbase affect wheelies?", a: "A taller centre of gravity or a shorter wheelbase lifts the front more easily." },
      { q: "Why roll the throttle on smoothly out of a corner?", a: "To feed drive the rear tyre can use and keep the chassis settled; a sudden fistful spins the rear or stands the bike up." },
    ],
  },
  {
    id: "traction", code: "07", name: "Traction Circle",
    cards: [
      { q: "What does the traction circle represent?", a: "One grip budget shared between braking/accelerating and turning — the combined demand must stay inside the circle." },
      { q: "Why can't you brake hard while fully leaned?", a: "Braking and cornering both draw on the same grip; together they exceed 100% and the tyre lets go." },
      { q: "What is trail braking?", a: "Bleeding off the brakes as you add lean, trading grip from braking to cornering so the total stays just inside the circle." },
      { q: "What shrinks the traction circle?", a: "Low grip — rain, cold tyres, gravel or ice — so you slide with less input." },
    ],
  },
  {
    id: "uktest", code: "08", name: "UK Mod 1",
    cards: [
      { q: "How wide is the U-turn strip?", a: "7.5 metres." },
      { q: "Minimum speed for the emergency stop and hazard avoidance (motorcycle)?", a: "50 km/h (32 mph). For mopeds it's 30 km/h (19 mph)." },
      { q: "In the hazard avoidance, when do you brake?", a: "Only after you're past the hazard and upright — swerve first, brake after, because steering and braking share grip." },
      { q: "Key skill for the slalom and figure-of-eight?", a: "Slow clutch/throttle control plus countersteering — and look ahead to the next cone, not down at the ground." },
      { q: "Where must you stop in the controlled and emergency stops?", a: "With the front wheel inside the marked cone box." },
    ],
  },
];
