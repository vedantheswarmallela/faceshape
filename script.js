// FINDO - Application Core & Data

// ==========================================================================
// 1. APPLICATION STATE
// ==========================================================================
let state = {
    username: '',
    faceShape: '',
    favorites: [],
    currentTab: 'analyzer',
    quizAnswers: [null, null, null, null],
    currentQuizQuestion: 0,
    
    // Virtual Try-On state variables
    tryon: {
        stream: null,
        facingMode: 'user', // 'user' for selfie front, 'environment' for back camera
        activeHairId: 'short-quiff', // Default selected hairstyle overlay
        scale: 1.0,
        rotate: 0,
        posX: 0,
        posY: 0,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        hairStartX: 0,
        hairStartY: 0
    }
};

// ==========================================================================
// 2. DATASETS (EXTRACTED FROM THE USER'S PDF GUIDES)
// ==========================================================================
const FACE_SHAPES_DATA = {
    oval: {
        id: 'oval',
        title: 'Oval Face',
        ratio: 'Length ≈ 1.5x width',
        description: 'Considered the most balanced and versatile face shape. The forehead is slightly wider than the jawline, with a gently rounded hairline. The jaw is narrower than the cheekbones and softly curved rather than angular.',
        goal: 'Maintain the natural balance and symmetry. Keep hair slightly off your forehead to showcase your features.',
        avoid: 'Too much vertical height on top which can make your face look overly long and narrow.',
        svgPath: `<svg viewBox="0 0 150 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="svg-neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6366f1" />
                    <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
            </defs>
            <!-- Vertical guide line -->
            <line x1="75" y1="10" x2="75" y2="170" class="svg-guide-line" />
            <!-- Horizontal width guides -->
            <line x1="25" y1="50" x2="125" y2="50" class="svg-guide-line" /> <!-- Forehead -->
            <line x1="15" y1="90" x2="135" y2="90" class="svg-guide-line" /> <!-- Cheekbone -->
            <line x1="30" y1="135" x2="120" y2="135" class="svg-guide-line" /> <!-- Jaw -->
            <!-- Main Face Silhouette -->
            <path d="M 75,10 C 115,10 135,50 135,100 C 135,145 105,170 75,170 C 45,170 15,145 15,100 C 15,50 35,10 75,10 Z" class="svg-face-line" />
            <!-- Minimal features for perspective -->
            <path d="M 55,90 Q 75,98 95,90" class="svg-feature" /> <!-- Eyes reference line -->
            <path d="M 70,115 L 75,120 L 80,115" class="svg-feature" /> <!-- Nose reference -->
            <path d="M 60,140 Q 75,148 90,140" class="svg-feature" /> <!-- Mouth reference -->
        </svg>`
    },
    round: {
        id: 'round',
        title: 'Round Face',
        ratio: 'Length ≈ Width',
        description: 'Equal face width and length with a soft, rounded jawline. Forehead, cheekbones, and jawline are similar in width, and the cheeks are often the fullest part of the face.',
        goal: 'Add vertical height, angles, and structure to elongate the face visually and define your features.',
        avoid: 'Flat, heavy fringes that hide the forehead and widen the cheeks.',
        svgPath: `<svg viewBox="0 0 150 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="svg-neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6366f1" />
                    <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
            </defs>
            <line x1="75" y1="15" x2="75" y2="165" class="svg-guide-line" />
            <line x1="20" y1="90" x2="130" y2="90" class="svg-guide-line" />
            <path d="M 75,15 C 115,15 135,45 135,90 C 135,135 115,165 75,165 C 35,165 15,135 15,90 C 15,45 35,15 75,15 Z" class="svg-face-line" />
            <path d="M 55,90 Q 75,98 95,90" class="svg-feature" />
            <path d="M 70,115 L 75,120 L 80,115" class="svg-feature" />
            <path d="M 60,140 Q 75,146 90,140" class="svg-feature" />
        </svg>`
    },
    square: {
        id: 'square',
        title: 'Square Face',
        ratio: 'Forehead ≈ Cheek ≈ Jaw',
        description: 'A strong, angular silhouette with a broad forehead and a wide, prominent, square jawline. The sides of the face are straight with minimal tapering from the temple to the jaw.',
        goal: 'Soften the strong, boxy edges with textured layers, soft curves, or keep it ultra-masculine with clean structured cuts.',
        avoid: 'Overly harsh, boxy haircuts with sharp geometric lines on the sides that exaggerate the jaw width.',
        svgPath: `<svg viewBox="0 0 150 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="svg-neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6366f1" />
                    <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
            </defs>
            <line x1="75" y1="20" x2="75" y2="160" class="svg-guide-line" />
            <line x1="25" y1="20" x2="125" y2="20" class="svg-guide-line" />
            <line x1="25" y1="160" x2="125" y2="160" class="svg-guide-line" />
            <path d="M 75,20 C 110,20 125,30 125,75 L 125,135 C 125,150 115,160 100,160 L 50,160 C 35,160 25,150 25,135 L 25,75 C 25,30 40,20 75,20 Z" class="svg-face-line" />
            <path d="M 55,90 Q 75,98 95,90" class="svg-feature" />
            <path d="M 70,115 L 75,120 L 80,115" class="svg-feature" />
            <path d="M 60,138 Q 75,144 90,138" class="svg-feature" />
        </svg>`
    },
    heart: {
        id: 'heart',
        title: 'Heart Face',
        ratio: 'Forehead is widest point',
        description: 'A broad forehead and wide cheekbones tapering steadily down into a narrow, pointed chin. The hairline may display a distinct widow\'s peak.',
        goal: 'Balance the narrowness of the chin by adding width near the lower face, or styling hair with textured volume on top.',
        avoid: 'Very tight, close-cropped sides that draw attention upwards and exaggerate the narrowness of the jaw.',
        svgPath: `<svg viewBox="0 0 150 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="svg-neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6366f1" />
                    <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
            </defs>
            <line x1="75" y1="20" x2="75" y2="170" class="svg-guide-line" />
            <line x1="15" y1="40" x2="135" y2="40" class="svg-guide-line" />
            <path d="M 75,25 C 105,10 135,20 135,65 C 135,105 105,145 75,170 C 45,145 15,105 15,65 C 15,20 45,10 75,25 Z" class="svg-face-line" />
            <path d="M 55,90 Q 75,98 95,90" class="svg-feature" />
            <path d="M 70,115 L 75,120 L 80,115" class="svg-feature" />
            <path d="M 62,140 Q 75,146 88,140" class="svg-feature" />
        </svg>`
    },
    diamond: {
        id: 'diamond',
        title: 'Diamond Face',
        ratio: 'Cheekbones are widest point',
        description: 'Wider, prominent cheekbones combined with a narrow forehead and a narrow, pointed chin. Forehead and jaw are narrow and similar in width.',
        goal: 'Soften the sharp cheekbones and add fullness, width, and texture at the forehead or jawline.',
        avoid: 'Overly geometric, sharp, or boxy cuts that add unnecessary sharpness to the cheekbones.',
        svgPath: `<svg viewBox="0 0 150 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="svg-neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6366f1" />
                    <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
            </defs>
            <line x1="75" y1="15" x2="75" y2="165" class="svg-guide-line" />
            <line x1="15" y1="85" x2="135" y2="85" class="svg-guide-line" />
            <path d="M 75,15 C 95,35 130,65 130,85 C 130,105 95,135 75,165 C 55,135 20,105 20,85 C 20,65 55,35 75,15 Z" class="svg-face-line" />
            <path d="M 55,90 Q 75,98 95,90" class="svg-feature" />
            <path d="M 70,115 L 75,120 L 80,115" class="svg-feature" />
            <path d="M 62,140 Q 75,146 88,140" class="svg-feature" />
        </svg>`
    },
    oblong: {
        id: 'oblong',
        title: 'Oblong Face',
        ratio: 'Length is notably > width',
        description: 'A longer face with straight, parallel cheek lines. The forehead, cheekbones, and jawline are similar in width, presenting a longer, rectangular profile.',
        goal: 'Create visual width on the sides and style the top with layers or fringes to balance the face length. Keep volume moderate.',
        avoid: 'Too much vertical height on top and extreme tight fades on the sides, which will make the face look even longer.',
        svgPath: `<svg viewBox="0 0 150 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="svg-neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6366f1" />
                    <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
            </defs>
            <line x1="75" y1="10" x2="75" y2="170" class="svg-guide-line" />
            <line x1="30" y1="10" x2="120" y2="10" class="svg-guide-line" />
            <line x1="30" y1="170" x2="120" y2="170" class="svg-guide-line" />
            <path d="M 75,10 C 110,10 120,20 120,65 L 120,135 C 120,155 110,170 95,170 L 55,170 C 40,170 30,155 30,135 L 30,65 C 30,20 40,10 75,10 Z" class="svg-face-line" />
            <path d="M 55,90 Q 75,98 95,90" class="svg-feature" />
            <path d="M 70,115 L 75,120 L 80,115" class="svg-feature" />
            <path d="M 60,140 Q 75,146 90,140" class="svg-feature" />
        </svg>`
    },
    triangle: {
        id: 'triangle',
        title: 'Triangle Face',
        ratio: 'Jawline is widest point',
        description: 'A narrow forehead and cheekbones widening sharply down to a broad, wide jawline. The face tapers outwards from the temples down to the chin.',
        goal: 'Add significant volume at the temples and forehead to widen the top of the head, balancing the wider jaw.',
        avoid: 'Slicked back styles with flat tops and bare temples, which make the lower jaw stand out.',
        svgPath: `<svg viewBox="0 0 150 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="svg-neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6366f1" />
                    <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
            </defs>
            <line x1="75" y1="15" x2="75" y2="165" class="svg-guide-line" />
            <line x1="20" y1="165" x2="130" y2="165" class="svg-guide-line" />
            <path d="M 75,15 C 95,15 110,35 115,70 L 130,135 C 130,155 115,165 95,165 L 55,165 C 35,165 20,155 20,135 L 35,70 C 40,35 55,15 75,15 Z" class="svg-face-line" />
            <path d="M 55,90 Q 75,98 95,90" class="svg-feature" />
            <path d="M 70,115 L 75,120 L 80,115" class="svg-feature" />
            <path d="M 58,138 Q 75,144 92,138" class="svg-feature" />
        </svg>`
    }
};

const HAIRSTYLES_DATA = [
    // === OVAL FACE ===
    {
        id: 'short-quiff',
        imageId: 'short-quiff',
        name: 'Short Quiff',
        suitableShapes: ['oval'],
        shortDesc: 'A clean, textured cut with volume styled forward and up over the forehead.',
        desc: 'A popular classic that sweeps the hair up and back at the front to show off the balanced facial geometry of an oval face shape.',
        difficulty: 'Medium',
        maintenance: 'Medium',
        product: 'Hair Clay / Matte Paste',
        hairType: 'Straight, Wavy, Thick',
        steps: ['Towel-dry hair until slightly damp.', 'Blow dry front hair upwards with fingers.', 'Apply clay from back to front.', 'Shape quiff up and forward.']
    },
    {
        id: 'classic-pompadour',
        imageId: 'classic-pompadour',
        name: 'Classic Pompadour',
        suitableShapes: ['oval', 'square'],
        shortDesc: 'A voluminous, swept-back style with substantial height at the crown.',
        desc: 'Sweeps hair back with high volume, highlighting structured bone features for oval and square face shapes.',
        difficulty: 'Hard',
        maintenance: 'High',
        product: 'Water-based Pomade',
        hairType: 'Straight, Thick',
        steps: ['Apply pomade to damp hair.', 'Use a round brush and blow dryer to pull front hair up and roll back.', 'Shape sides back with comb.', 'Finish with hairspray to lock.']
    },
    {
        id: 'side-part-deep',
        imageId: 'side-part',
        name: 'Side Part (Deep)',
        suitableShapes: ['oval'],
        shortDesc: 'A formal parting swept flat and clean to one side of the scalp.',
        desc: 'A deep side part breaks symmetry slightly, framing the face beautifully and presenting a neat, formal look.',
        difficulty: 'Medium',
        maintenance: 'Medium',
        product: 'Styling Cream',
        hairType: 'Fine, Straight',
        steps: ['Comb a clean line on one side.', 'Sweep hair flat to the sides.', 'Apply styling cream to secure the part.', 'Towel style gently.']
    },
    {
        id: 'textured-crop',
        imageId: 'textured-crop',
        name: 'Textured Crop',
        suitableShapes: ['oval', 'diamond', 'triangle'],
        shortDesc: 'Short, heavily layered textured top with a clean cropped fringe.',
        desc: 'Frames the face and covers parts of the forehead, making it versatile for oval, diamond, and triangle shapes.',
        difficulty: 'Easy',
        maintenance: 'Medium',
        product: 'Styling Powder / Clay',
        hairType: 'Straight, Wavy',
        steps: ['Combed hair forward from crown.', 'Apply texture powder to roots.', 'Rake fingers through to define layers.', 'Pinch ends for piecey details.']
    },
    {
        id: 'faux-hawk',
        imageId: 'faux-hawk',
        name: 'Faux Hawk',
        suitableShapes: ['oval', 'diamond'],
        shortDesc: 'A modern cut styled upward and inward toward a central peak.',
        desc: 'Draws focus to the center line of the face, softening wide cheekbones on diamond faces and matching oval proportions.',
        difficulty: 'Medium',
        maintenance: 'Medium',
        product: 'Fiber Wax / Clay',
        hairType: 'Thick, Coarse',
        steps: ['Rub wax between palms.', 'Push hair from both sides toward the center line.', 'Style the peak upwards.', 'Define individual tips.']
    },
    {
        id: 'curly-top-short',
        imageId: 'curly-top-short',
        name: 'Curly Top (Short)',
        suitableShapes: ['oval'],
        shortDesc: 'Tapered sides highlighting tight natural curls on top.',
        desc: 'Perfect for oval shapes to display natural curls while maintaining clean, tapered side lines.',
        difficulty: 'Easy',
        maintenance: 'Medium',
        product: 'Curl Cream / Mousse',
        hairType: 'Curly, Wavy',
        steps: ['Apply curl cream to damp curls.', 'Diffuser dry or air dry curls.', 'Define curls on top with fingers.', 'Keep sides clean and short.']
    },

    // === SQUARE FACE ===
    {
        id: 'caesar-cut',
        imageId: 'french-crop',
        name: 'Caesar Cut',
        suitableShapes: ['square'],
        shortDesc: 'A short cut with a straight, horizontally cropped fringe.',
        desc: 'Softens a square angular jawline by introducing horizontal lines at the forehead.',
        difficulty: 'Easy',
        maintenance: 'Low',
        product: 'Light Paste',
        hairType: 'Straight, Fine',
        steps: ['Wash and towel dry.', 'Apply a small dab of paste.', 'Comb fringe straight down.', 'Style top forward.']
    },
    {
        id: 'crew-cut',
        imageId: 'crew-cut',
        name: 'Crew Cut',
        suitableShapes: ['square'],
        shortDesc: 'Classic military taper short cut, flat top and clean sides.',
        desc: 'A neat, low-maintenance classic that frames strong angular jawlines cleanly.',
        difficulty: 'Easy',
        maintenance: 'Low',
        product: 'Matte Paste',
        hairType: 'All Hair Types',
        steps: ['Apply dime-sized matte paste.', 'Push front hair up and to the side.', 'Smooth top down following growth.']
    },
    {
        id: 'buzz-cut',
        imageId: 'buzz-cut',
        name: 'Buzz Cut',
        suitableShapes: ['square', 'oblong'],
        shortDesc: 'An ultra-short clipper cut following the skull shape.',
        desc: 'Highlights strong square jawlines. Oblong shapes should keep it very close to reduce length.',
        difficulty: 'Easy',
        maintenance: 'Low',
        product: 'None',
        hairType: 'Coarse, Thick',
        steps: ['Ask barber for a skin fade buzz cut.', 'Wash regularly to keep scalp clean.', 'Towel dry only.']
    },
    {
        id: 'side-part-hard',
        imageId: 'side-part',
        name: 'Side Part (Hard Part)',
        suitableShapes: ['square'],
        shortDesc: 'Sleek parting featuring a shaved line for separation.',
        desc: 'Adds angular structure to balance a broad square forehead and a strong jaw.',
        difficulty: 'Medium',
        maintenance: 'High',
        product: 'Pomade',
        hairType: 'Straight, Thick',
        steps: ['Locate shaved hard part line.', 'Comb sides flat and top diagonally back.', 'Secure with pomade.', 'Set with comb lines.']
    },
    {
        id: 'slick-back-undercut',
        imageId: 'slick-back',
        name: 'Slick Back Undercut',
        suitableShapes: ['square'],
        shortDesc: 'High-contrast shave sides with slicked back top.',
        desc: 'Perfect for square face shapes to create a bold, modern, masculine profile.',
        difficulty: 'Medium',
        maintenance: 'High',
        product: 'High-hold Pomade',
        hairType: 'Straight, Thick',
        steps: ['Comb damp hair straight back.', 'Blow dry backward to set roots.', 'Apply pomade liberally.', 'Slick flat with a comb.']
    },

    // === ROUND FACE ===
    {
        id: 'high-fade-pompadour',
        imageId: 'classic-pompadour',
        name: 'High Fade Pompadour',
        suitableShapes: ['round'],
        shortDesc: 'High-fade sides with a voluminous pompadour crown.',
        desc: 'Elongates round face shapes by adding maximum height on top and skin-short sides.',
        difficulty: 'Hard',
        maintenance: 'High',
        product: 'Pomade / Volume Spray',
        hairType: 'Thick, Straight',
        steps: ['Blow dry upward with round brush.', 'Apply strong pomade.', 'Pull comb upward at the fringe.', 'Lock with hairspray.']
    },
    {
        id: 'textured-pompadour',
        imageId: 'classic-pompadour',
        name: 'Textured Pompadour',
        suitableShapes: ['round'],
        shortDesc: 'A relaxed pompadour styled with texture and flow.',
        desc: 'Gives vertical length to round cheekbones while looking modern and messy.',
        difficulty: 'Medium',
        maintenance: 'High',
        product: 'Matte Clay',
        hairType: 'Wavy, Straight',
        steps: ['Apply pre-styling sea salt spray.', 'Blow dry up and back.', 'Apply matte clay with fingers.', 'Tousle top to create texture.']
    },
    {
        id: 'angular-fringe',
        imageId: 'angular-fringe',
        name: 'Angular Fringe',
        suitableShapes: ['round'],
        shortDesc: 'Asymmetric fringe cut at an angle to frame the forehead.',
        desc: 'Adds sharp geometric angles to break up round facial fullness.',
        difficulty: 'Medium',
        maintenance: 'Medium',
        product: 'Styling Paste',
        hairType: 'Straight, Fine',
        steps: ['Comb fringe diagonally across forehead.', 'Apply paste with fingers.', 'Create messy texture on top.', 'Pinch fringe ends.']
    },
    {
        id: 'asymmetric-quiff',
        imageId: 'asymmetric-quiff',
        name: 'Asymmetric Quiff',
        suitableShapes: ['round'],
        shortDesc: 'Off-center quiff swept up and slightly to one side.',
        desc: 'Draws focus diagonally, visually reducing the roundness of the jaw and cheeks.',
        difficulty: 'Medium',
        maintenance: 'Medium',
        product: 'Fiber Wax',
        hairType: 'Thick, Wavy',
        steps: ['Blow dry hair up and slightly to the side.', 'Apply fiber wax for pliable hold.', 'Pull front hair up.', 'Tousle sides.']
    },
    {
        id: 'side-part-volume',
        imageId: 'side-part',
        name: 'Side Part with Volume',
        suitableShapes: ['round', 'oblong'],
        shortDesc: 'Parted style with vertical volume on the larger side.',
        desc: 'Combines parting structure with quiff height to balance round and oblong faces.',
        difficulty: 'Medium',
        maintenance: 'Medium',
        product: 'Styling Cream',
        hairType: 'Straight, Wavy',
        steps: ['Part damp hair.', 'Blow dry the volume side upward.', 'Sweep back and side.', 'Apply cream to lock lines.']
    },
    {
        id: 'undercut-pompadour',
        imageId: 'classic-pompadour',
        name: 'Undercut Pompadour',
        suitableShapes: ['round'],
        shortDesc: 'Disconnected undercut sides styled with a high pompadour.',
        desc: 'Eliminates side bulk completely, creating a vertical silhouette that flatters round jaws.',
        difficulty: 'Hard',
        maintenance: 'High',
        product: 'Pomade',
        hairType: 'Straight, Thick',
        steps: ['Section off top hair.', 'Blow dry up and back.', 'Apply pomade evenly.', 'Style top into high pompadour contour.']
    },

    // === OBLONG FACE ===
    {
        id: 'short-sides-long-top',
        imageId: 'short-quiff',
        name: 'Short Sides Long Top',
        suitableShapes: ['oblong', 'diamond'],
        shortDesc: 'Moderate sides with structured top kept flat to the head.',
        desc: 'Keeps sides neat. Top is styled forward or flat to avoid adding face length on oblong profiles.',
        difficulty: 'Easy',
        maintenance: 'Medium',
        product: 'Matte Clay',
        hairType: 'Wavy, Straight',
        steps: ['Blow dry top hair flat/forward.', 'Apply clay to top.', 'Push hair slightly forward.', 'Smooth down crown.']
    },
    {
        id: 'curtain-hair',
        imageId: 'curtain-hair',
        name: 'Curtain Hair',
        suitableShapes: ['oblong', 'heart'],
        shortDesc: 'Split center-parted fringe that frames the forehead.',
        desc: 'Splits front bangs, covering temples to reduce oblong length and heart forehead width.',
        difficulty: 'Easy',
        maintenance: 'Medium',
        product: 'Sea Salt Spray',
        hairType: 'Wavy, Curly',
        steps: ['Part damp hair down middle.', 'Apply sea salt spray.', 'Blow dry flat to sides.', 'Tousle locks gently.']
    },
    {
        id: 'medium-curls',
        imageId: 'curly-top-medium',
        name: 'Medium Curls',
        suitableShapes: ['oblong'],
        shortDesc: 'Natural messy curls styled with moderate side volume.',
        desc: 'Adds visual width to the sides of an oblong face, neutralizing vertical length.',
        difficulty: 'Easy',
        maintenance: 'Medium',
        product: 'Curl Cream',
        hairType: 'Curly, Coarse',
        steps: ['Apply curl cream to wet curls.', 'Diffuse dry to build side width.', 'Leave top curls natural and loose.']
    },
    {
        id: 'pompadour-low-fade',
        imageId: 'classic-pompadour',
        name: 'Pompadour with Low Fade',
        suitableShapes: ['oblong'],
        shortDesc: 'Pompadour styled with low volume and a low fade.',
        desc: 'A low fade retains width on the sides, balancing oblong proportions.',
        difficulty: 'Hard',
        maintenance: 'High',
        product: 'Cream Pomade',
        hairType: 'Fine, Straight',
        steps: ['Blow dry top with low height.', 'Apply cream pomade.', 'Comb back flat.', 'Keep side fades low.']
    },

    // === HEART FACE ===
    {
        id: 'side-swept-fringe',
        imageId: 'textured-crop',
        name: 'Side Swept Fringe',
        suitableShapes: ['heart'],
        shortDesc: 'Fringe combed forward and swept off to one side.',
        desc: 'Covers the wide forehead of heart shapes, balancing the pointed chin.',
        difficulty: 'Easy',
        maintenance: 'Low',
        product: 'Matte Paste',
        hairType: 'Fine, Straight',
        steps: ['Blow dry hair forward.', 'Sweep bangs to side.', 'Apply paste for control.', 'Keep side burns neat.']
    },
    {
        id: 'longer-top-volume',
        imageId: 'wavy-quiff',
        name: 'Longer Top with Volume',
        suitableShapes: ['heart'],
        shortDesc: 'Medium length layers styled back with loose volume.',
        desc: 'Adds volume and flow to soften the tapering lines of a heart face shape.',
        difficulty: 'Medium',
        maintenance: 'Medium',
        product: 'Sea Salt Spray',
        hairType: 'Wavy, Thick',
        steps: ['Apply spray to damp locks.', 'Blow dry back with fingers.', 'Leave flow loose and wavy.', 'Do not crop sides tight.']
    },
    {
        id: 'wavy-side-part',
        imageId: 'side-part',
        name: 'Wavy Side Part',
        suitableShapes: ['heart'],
        shortDesc: 'Soft parted wave locks with moderate length.',
        desc: 'Keeps sides slightly longer to add visual width near the jaw, balancing heart chins.',
        difficulty: 'Medium',
        maintenance: 'Medium',
        product: 'Styling Paste',
        hairType: 'Wavy, Fine',
        steps: ['Part damp hair.', 'Blow dry sides slightly out.', 'Style top wave to the side.', 'Set with paste.']
    },
    {
        id: 'textured-fringe',
        imageId: 'textured-crop',
        name: 'Textured Fringe',
        suitableShapes: ['heart'],
        shortDesc: 'Messy, combed forward textured crop bangs.',
        desc: 'Breaks up forehead width with choppy texture, flattering heart geometries.',
        difficulty: 'Easy',
        maintenance: 'Medium',
        product: 'Styling Powder',
        hairType: 'Thick, Straight',
        steps: ['Blow dry top forward.', 'Apply powder to crown.', 'Tousle bangs messy.', 'Keep sides cropped softly.']
    },
    {
        id: 'pompadour-gentle-sides',
        imageId: 'classic-pompadour',
        name: 'Pompadour (Gentle Sides)',
        suitableShapes: ['heart'],
        shortDesc: 'Sleek pompadour with scissors-cut gentle sides.',
        desc: 'Avoids tight fades. Keeps sides soft and textured to balance pointed jawlines.',
        difficulty: 'Hard',
        maintenance: 'High',
        product: 'Pomade',
        hairType: 'Straight, Thick',
        steps: ['Style top up and back.', 'Comb sides flat but not shaved.', 'Blend top with soft side layers.']
    },

    // === DIAMOND FACE ===
    {
        id: 'side-swept-volume',
        imageId: 'side-part',
        name: 'Side-swept Volume',
        suitableShapes: ['diamond'],
        shortDesc: 'Textured side-swept locks with moderate height.',
        desc: 'Introduces volume near the forehead to balance wide diamond cheekbones.',
        difficulty: 'Medium',
        maintenance: 'Medium',
        product: 'Matte Clay',
        hairType: 'Wavy, Thick',
        steps: ['Blow dry hair up and to the side.', 'Rake clay through with hands.', 'Style volume over temples.']
    },
    {
        id: 'curly-top-medium',
        imageId: 'curly-top-medium',
        name: 'Curly Top (Medium)',
        suitableShapes: ['diamond'],
        shortDesc: 'Messy curly layers styled up and forward.',
        desc: 'Curly texture breaks the sharp angular cheekbones of a diamond face shape.',
        difficulty: 'Easy',
        maintenance: 'Medium',
        product: 'Curl Mousse',
        hairType: 'Curly, Thick',
        steps: ['Apply mousse to damp curls.', 'Diffuser dry.', 'Tousle top forward.', 'Keep sides tapered softly.']
    },
    {
        id: 'pompadour-skin-fade',
        imageId: 'classic-pompadour',
        name: 'Pompadour with Skin Fade',
        suitableShapes: ['diamond'],
        shortDesc: 'Skin fade sides topped with a high pompadour.',
        desc: 'Skin fade exposes temple lines, balancing narrow diamond foreheads.',
        difficulty: 'Hard',
        maintenance: 'High',
        product: 'Strong Pomade',
        hairType: 'Straight, Thick',
        steps: ['Blow dry up and back.', 'Apply strong pomade.', 'Style top high and neat.', 'Keep fade clean.']
    },

    // === TRIANGLE FACE ===
    {
        id: 'textured-fringe-triangle',
        imageId: 'textured-crop',
        name: 'Textured Fringe',
        suitableShapes: ['triangle'],
        shortDesc: 'Textured messy crop styled forward to hide narrow temples.',
        desc: 'Provides fullness around the temples, balancing a wider jawline.',
        difficulty: 'Easy',
        maintenance: 'Low',
        product: 'Clay',
        hairType: 'Straight, Wavy',
        steps: ['Combed hair forward.', 'Tousle with clay for volume.', 'Style fringe messy over forehead.']
    },
    {
        id: 'pompadour-triangle',
        imageId: 'classic-pompadour',
        name: 'Pompadour',
        suitableShapes: ['triangle'],
        shortDesc: 'Classic pompadour styling adding volume to top.',
        desc: 'Adds weight and width at the forehead, neutralizing a wide bottom jaw.',
        difficulty: 'Hard',
        maintenance: 'High',
        product: 'Pomade',
        hairType: 'Straight, Thick',
        steps: ['Blow dry top up and back.', 'Comb sides flat.', 'Style crown into high pompadour.']
    },
    {
        id: 'fringe-up-triangle',
        imageId: 'textured-crop',
        name: 'Fringe Up',
        suitableShapes: ['triangle'],
        shortDesc: 'Short cropped sides with front styled up.',
        desc: 'Draws focus upwards, minimizing the visual width of the lower jaw.',
        difficulty: 'Easy',
        maintenance: 'Low',
        product: 'Fiber Wax',
        hairType: 'Straight, Fine',
        steps: ['Blow dry front up.', 'Apply wax to roots.', 'Pinch sections to hold volume.']
    },
    {
        id: 'messy-fringe-triangle',
        imageId: 'messy-waves',
        name: 'Messy Fringe',
        suitableShapes: ['triangle'],
        shortDesc: 'Layered waves falling messy over forehead.',
        desc: 'Adds width at the temples and forehead to balance the triangular shape.',
        difficulty: 'Easy',
        maintenance: 'Low',
        product: 'Sea Salt Spray',
        hairType: 'Wavy, Curly',
        steps: ['Apply spray to damp waves.', 'Blow dry messy.', 'Let locks frame the upper temples.']
    }
];

// ==========================================================================
// 3. QUIZ QUESTIONS & CONFIG
// ==========================================================================
const QUIZ_QUESTIONS = [
    {
        question: "How does your face length compare to your face width?",
        options: [
            { text: "They are almost equal (very close in size)", val: { round: 3, square: 3 } },
            { text: "It is slightly longer (length is roughly 1.5x width)", val: { oval: 3, heart: 2, diamond: 2, triangle: 1 } },
            { text: "It is noticeably longer (length is much greater than width)", val: { oblong: 3 } }
        ]
    },
    {
        question: "Where is the widest part of your face?",
        options: [
            { text: "My cheekbones (widest across the center)", val: { oval: 2, round: 2, diamond: 3 } },
            { text: "My forehead (tapers down towards the chin)", val: { heart: 3 } },
            { text: "My jawline (widest at the bottom)", val: { triangle: 3 } },
            { text: "They are all roughly equal (forehead, cheeks, and jaw are same width)", val: { square: 3, oblong: 3 } }
        ]
    },
    {
        question: "How would you describe your jawline?",
        options: [
            { text: "Soft and rounded (smooth curves, no sharp edges)", val: { round: 3, oval: 2 } },
            { text: "Strong and angular (sharp corner angles, square shape)", val: { square: 3, oblong: 2 } },
            { text: "Narrow and pointed (slender, tapers down sharply)", val: { heart: 3, diamond: 3 } }
        ]
    },
    {
        question: "Compare the width of your forehead to the width of your jawline:",
        options: [
            { text: "My forehead is wider than my jawline", val: { heart: 2, oval: 1 } },
            { text: "My forehead is narrower than my jawline", val: { triangle: 3 } },
            { text: "They are roughly equal in width", val: { square: 2, oblong: 2, round: 1 } }
        ]
    }
];

// ==========================================================================
// 4. MAIN CONTROLLER & DOM INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();
    
    // Check local storage for existing session
    initSession();
    
    // Register Logo Button Click Handler (Fades out temporarily to reveal Instagram handle)
    document.getElementById('app-logo-btn').addEventListener('click', function() {
        const logoContent = document.getElementById('logo-content');
        const instagramHandle = document.getElementById('instagram-handle');
        const btn = this;
        
        // Disable button interactions
        btn.style.pointerEvents = 'none';
        
        // Hide FINDO logo content
        logoContent.style.opacity = '0';
        logoContent.style.transform = 'scale(0.8)';
        
        // Reveal Instagram handle
        instagramHandle.style.opacity = '1';
        instagramHandle.style.transform = 'translateY(-50%) scale(1.1)';
        
        // Reset state
        resetQuiz();
        switchTab('analyzer');
        
        // After 1.5 seconds, swap back to standard logo
        setTimeout(() => {
            // Fade out Instagram handle
            instagramHandle.style.opacity = '0';
            instagramHandle.style.transform = 'translateY(-50%) scale(0.8)';
            
            // Fade in logo content
            setTimeout(() => {
                logoContent.style.opacity = '1';
                logoContent.style.transform = 'scale(1)';
                btn.style.pointerEvents = 'auto';
            }, 300);
        }, 1500);
    });
    
    // Register Welcome Form Handler
    document.getElementById('username-form').addEventListener('submit', handleLogin);
    
    // Register Tab Navigation Click Handlers
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const targetTab = e.currentTarget.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
    
    // Register Quiz Buttons
    document.getElementById('quiz-prev-btn').addEventListener('click', prevQuizQuestion);
    document.getElementById('quiz-next-btn').addEventListener('click', nextQuizQuestion);
    document.getElementById('retake-quiz-btn').addEventListener('click', resetQuiz);
    document.getElementById('view-matching-styles-btn').addEventListener('click', showMatchedCatalogStyles);
    
    // Register Catalog Dropdown Filter
    document.getElementById('shape-filter-select').addEventListener('change', (e) => {
        renderCatalog(e.target.value);
    });
    
    // Register Profile Reset Button
    document.getElementById('profile-reset-btn').addEventListener('click', resetProfile);
    
    // Close Modal Button
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('style-modal').addEventListener('click', (e) => {
        if (e.target.id === 'style-modal') closeModal();
    });
});

// ==========================================================================
// 5. SESSION & VIEW MANAGEMENT
// ==========================================================================
function initSession() {
    const savedUsername = localStorage.getItem('findo_username');
    const savedShape = localStorage.getItem('findo_faceshape');
    const savedFavs = localStorage.getItem('findo_favorites');
    
    if (savedUsername) {
        state.username = savedUsername;
        state.faceShape = savedShape || '';
        state.favorites = savedFavs ? JSON.parse(savedFavs) : [];
        
        // Show App UI
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        // Update Brand pill & user greetings
        document.getElementById('user-display-name').textContent = state.username;
        document.getElementById('nav-username').textContent = state.username;
        document.getElementById('avatar-char').textContent = state.username.charAt(0).toUpperCase();
        document.getElementById('profile-avatar-big').textContent = state.username.charAt(0).toUpperCase();
        document.getElementById('profile-username-display').textContent = state.username;
        
        updateProfileTab();
        
        // Render Initial Dashboard
        if (state.faceShape) {
            showResultCard(state.faceShape);
            // Default filter to matched shape in catalog
            document.getElementById('shape-filter-select').value = state.faceShape;
            renderCatalog(state.faceShape);
        } else {
            initQuiz();
            renderCatalog('all');
        }
    }
}

function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username-input').value.trim();
    if (!usernameInput) return;
    
    state.username = usernameInput;
    localStorage.setItem('findo_username', usernameInput);
    
    // Transition UI
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // Setup displays
    document.getElementById('user-display-name').textContent = state.username;
    document.getElementById('nav-username').textContent = state.username;
    document.getElementById('avatar-char').textContent = state.username.charAt(0).toUpperCase();
    document.getElementById('profile-avatar-big').textContent = state.username.charAt(0).toUpperCase();
    document.getElementById('profile-username-display').textContent = state.username;
    
    // Initialize app modules
    initQuiz();
    renderCatalog('all');
    updateProfileTab();
    switchTab('analyzer');
}

function switchTab(tabId) {
    state.currentTab = tabId;
    
    // Toggle active classes on nav buttons
    document.querySelectorAll('.nav-tab').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Toggle active sections
    document.querySelectorAll('.view-section').forEach(sec => {
        if (sec.id === `${tabId}-view`) {
            sec.classList.remove('hidden');
            sec.classList.add('active');
        } else {
            sec.classList.add('hidden');
            sec.classList.remove('active');
        }
    });
    
    // Trigger sub-renderers or camera handlers
    if (tabId === 'profile') {
        updateProfileTab();
    }
    
    if (tabId === 'tryon') {
        initTryonView();
    } else {
        stopTryonCamera();
    }
}

function resetProfile() {
    if (confirm("Are you sure you want to reset your profile? This will delete your saved face shape and bookmarked hairstyles.")) {
        localStorage.clear();
        state = {
            username: '',
            faceShape: '',
            favorites: [],
            currentTab: 'analyzer',
            quizAnswers: [null, null, null, null],
            currentQuizQuestion: 0
        };
        
        // Return to welcome screen
        document.getElementById('username-input').value = '';
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('welcome-screen').classList.remove('hidden');
        
        // Reset Analyzer
        document.getElementById('analyzer-result-card').classList.add('hidden');
        document.getElementById('quiz-container').classList.remove('hidden');
    }
}

// ==========================================================================
// 6. FACE ANALYZER QUIZ LOGIC
// ==========================================================================
function initQuiz() {
    state.quizAnswers = [null, null, null, null];
    state.currentQuizQuestion = 0;
    
    // Hide results card if any, display quiz container
    document.getElementById('analyzer-result-card').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    
    renderQuizQuestion();
    renderDirectSelectorList();
}

function renderQuizQuestion() {
    const qIndex = state.currentQuizQuestion;
    const qData = QUIZ_QUESTIONS[qIndex];
    const quizContent = document.getElementById('quiz-content');
    
    // Update progress bar
    const progressPct = ((qIndex + 1) / QUIZ_QUESTIONS.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = `${progressPct}%`;
    document.getElementById('current-q-num').textContent = qIndex + 1;
    
    // Build options HTML
    let optionsHtml = '';
    qData.options.forEach((opt, idx) => {
        const isSelected = state.quizAnswers[qIndex] === idx ? 'selected' : '';
        optionsHtml += `
            <button class="quiz-option-btn ${isSelected}" onclick="selectQuizOption(${idx})">
                <span class="quiz-option-title">${opt.text}</span>
            </button>
        `;
    });
    
    quizContent.innerHTML = `
        <h3 class="quiz-question-title animate-fade-in">${qData.question}</h3>
        <div class="quiz-options">
            ${optionsHtml}
        </div>
    `;
    
    // Update Navigation buttons
    document.getElementById('quiz-prev-btn').disabled = qIndex === 0;
    
    const hasSelected = state.quizAnswers[qIndex] !== null;
    document.getElementById('quiz-next-btn').disabled = !hasSelected;
    
    // Toggle "Next" text to "Calculate" on the last question
    const nextBtnSpan = document.querySelector('#quiz-next-btn span');
    if (qIndex === QUIZ_QUESTIONS.length - 1) {
        nextBtnSpan.textContent = 'Calculate Shape';
    } else {
        nextBtnSpan.textContent = 'Next';
    }
}

// Global scope injection for inline onclick
window.selectQuizOption = function(optionIndex) {
    const qIndex = state.currentQuizQuestion;
    state.quizAnswers[qIndex] = optionIndex;
    
    // Re-render to show selected active class
    renderQuizQuestion();
    
    // Auto-advance by 200ms for a snappy feeling
    setTimeout(() => {
        nextQuizQuestion();
    }, 250);
};

function nextQuizQuestion() {
    const qIndex = state.currentQuizQuestion;
    if (state.quizAnswers[qIndex] === null) return;
    
    if (qIndex < QUIZ_QUESTIONS.length - 1) {
        state.currentQuizQuestion++;
        renderQuizQuestion();
    } else {
        calculateFaceShape();
    }
}

function prevQuizQuestion() {
    if (state.currentQuizQuestion > 0) {
        state.currentQuizQuestion--;
        renderQuizQuestion();
    }
}

function calculateFaceShape() {
    // Scoring system initialized
    const scores = { oval: 0, round: 0, square: 0, heart: 0, diamond: 0, oblong: 0, triangle: 0 };
    
    // Compile scores
    state.quizAnswers.forEach((ansIdx, qIdx) => {
        if (ansIdx === null) return;
        const weights = QUIZ_QUESTIONS[qIdx].options[ansIdx].val;
        for (let shape in weights) {
            if (scores.hasOwnProperty(shape)) {
                scores[shape] += weights[shape];
            }
        }
    });
    
    // Find the shape with the maximum score
    let bestShape = 'oval'; // Default backup
    let maxScore = -1;
    for (let shape in scores) {
        if (scores[shape] > maxScore) {
            maxScore = scores[shape];
            bestShape = shape;
        }
    }
    
    // Save to state
    state.faceShape = bestShape;
    localStorage.setItem('findo_faceshape', bestShape);
    
    // Update displays
    showResultCard(bestShape);
    
    // Sync filters
    document.getElementById('shape-filter-select').value = bestShape;
    renderCatalog(bestShape);
    updateProfileTab();
}

function showResultCard(shapeId) {
    const shapeData = FACE_SHAPES_DATA[shapeId];
    if (!shapeData) return;
    
    // Hide Quiz container, reveal results card
    document.getElementById('quiz-container').classList.add('hidden');
    const resultCard = document.getElementById('analyzer-result-card');
    resultCard.classList.remove('hidden');
    
    // Populate card details
    document.getElementById('result-shape-title').textContent = shapeData.title;
    
    // Greet the user nicely with congratulations!
    const greetingText = `🎉 Congratulations, ${state.username}! You have this face shape.`;
    document.getElementById('result-personal-greeting').textContent = greetingText;
    
    document.getElementById('result-defining-ratio').textContent = `Ratio: ${shapeData.ratio}`;
    document.getElementById('result-shape-desc').textContent = shapeData.description;
    document.getElementById('result-styling-goal').textContent = shapeData.goal;
    document.getElementById('result-styling-avoid').textContent = shapeData.avoid;
    
    // Set SVG outline
    document.getElementById('result-shape-svg-container').innerHTML = shapeData.svgPath;
    
    // Auto-scroll to view results
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

function resetQuiz() {
    initQuiz();
}

function showMatchedCatalogStyles() {
    switchTab('catalog');
    const catalogGrid = document.getElementById('catalog-grid');
    catalogGrid.scrollIntoView({ behavior: 'smooth' });
}

// Render the skip selector side panel
function renderDirectSelectorList() {
    const selectorList = document.getElementById('direct-shape-list');
    let listHtml = '';
    
    // Map of shape ID to its simplified mini SVG markup
    const miniSVGs = {
        oval: `<svg class="mini-shape-svg" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="26" ry="36" class="mini-shape-path" /></svg>`,
        round: `<svg class="mini-shape-svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" class="mini-shape-path" /></svg>`,
        square: `<svg class="mini-shape-svg" viewBox="0 0 100 100"><rect x="22" y="20" width="56" height="60" rx="8" class="mini-shape-path" /></svg>`,
        heart: `<svg class="mini-shape-svg" viewBox="0 0 100 100"><path d="M 50,30 C 65,15 82,22 82,45 C 82,65 65,80 50,88 C 35,80 18,65 18,45 C 18,22 35,15 50,30 Z" class="mini-shape-path" /></svg>`,
        diamond: `<svg class="mini-shape-svg" viewBox="0 0 100 100"><path d="M 50,18 L 80,50 L 50,82 L 20,50 Z" class="mini-shape-path" /></svg>`,
        oblong: `<svg class="mini-shape-svg" viewBox="0 0 100 100"><rect x="25" y="14" width="50" height="72" rx="6" class="mini-shape-path" /></svg>`,
        triangle: `<svg class="mini-shape-svg" viewBox="0 0 100 100"><path d="M 50,20 L 80,80 L 20,80 Z" class="mini-shape-path" /></svg>`
    };
    
    for (let key in FACE_SHAPES_DATA) {
        const shape = FACE_SHAPES_DATA[key];
        const svg = miniSVGs[key] || '';
        listHtml += `
            <button class="direct-btn direct-btn-${key}" onclick="selectShapeDirectly('${key}')">
                <div class="direct-btn-label">
                    ${svg}
                    <span>${shape.title}</span>
                </div>
                <i data-lucide="chevron-right"></i>
            </button>
        `;
    }
    selectorList.innerHTML = listHtml;
    lucide.createIcons({ attrs: { class: 'direct-chevron' } });
}

window.selectShapeDirectly = function(shapeId) {
    state.faceShape = shapeId;
    localStorage.setItem('findo_faceshape', shapeId);
    showResultCard(shapeId);
    document.getElementById('shape-filter-select').value = shapeId;
    renderCatalog(shapeId);
    updateProfileTab();
};

// ==========================================================================
// 7. CATALOG EXPLORER & HAIRSTYLES RENDERER
// ==========================================================================
function renderCatalog(filterShape = 'all') {
    const catalogGrid = document.getElementById('catalog-grid');
    
    if (filterShape === 'all') {
        // Render 7 Face Shape Selection Cards (Shape Directory)
        let shapesHtml = '';
        for (let key in FACE_SHAPES_DATA) {
            const shape = FACE_SHAPES_DATA[key];
            const matchingCutsCount = HAIRSTYLES_DATA.filter(h => h.suitableShapes.includes(key)).length;
            shapesHtml += `
                <div class="glass-card shape-selector-card animate-fade-in-up" onclick="selectShapeFilter('${key}')" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; text-align:center; gap:16px;">
                    <div style="width: 100px; height: 120px; background: rgba(255,255,255,0.4); padding:10px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                        ${shape.svgPath}
                    </div>
                    <div>
                        <h3 class="style-title" style="font-size:1.2rem; margin-bottom:4px; color:var(--color-text-primary);">${shape.title}</h3>
                        <span class="measurements-pill" style="font-size:0.75rem;">${shape.ratio}</span>
                    </div>
                    <p style="font-size:0.85rem; color:var(--color-text-secondary); line-height:1.4; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
                        ${shape.description}
                    </p>
                    <button class="btn-card-action" style="margin-top:auto;">
                        <span>Explore Recommendations (${matchingCutsCount})</span>
                    </button>
                </div>
            `;
        }
        
        catalogGrid.className = 'catalog-grid';
        catalogGrid.innerHTML = shapesHtml;
        return;
    }
    
    // Render Single Face Shape Styling Profile (Full PDF Details)
    const shape = FACE_SHAPES_DATA[filterShape];
    if (!shape) return;
    
    // Get haircuts matching this shape
    const matchingCuts = HAIRSTYLES_DATA.filter(h => h.suitableShapes.includes(filterShape));
    
    let cutsHtml = '';
    matchingCuts.forEach(cut => {
        const isFav = state.favorites.includes(cut.id) ? 'active' : '';
        const diffColor = cut.difficulty === 'Easy' ? '#10b981' : cut.difficulty === 'Medium' ? '#d97706' : '#ef4444';
        
        cutsHtml += `
            <div class="glass-card style-card animate-fade-in-up" style="padding: 20px; display: flex; flex-direction: row; gap: 20px; align-items: center; min-height: 160px;">
                <div class="style-image-wrapper" style="width: 120px; height: 120px; border-radius: 10px; flex-shrink:0;">
                    <img class="style-card-image" src="assets/${cut.imageId}.png" alt="${cut.name}" style="background:#ffffff; object-fit:contain; width:100%; height:100%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="style-image-placeholder" style="display: none; flex-direction: column; align-items: center; justify-content: center; width:100%; height:100%;">
                        <i data-lucide="scissors" style="width:20px; height:20px;"></i>
                    </div>
                </div>
                <div style="flex-grow:1; display:flex; flex-direction:column; gap:8px; justify-content:center;">
                    <div style="display:flex; justify-content:between; align-items:center;">
                        <h4 class="style-title" style="font-size:1.1rem; margin:0; color:var(--color-text-primary);">${cut.name}</h4>
                        <button class="favorite-btn ${isFav}" onclick="toggleFavorite(event, '${cut.id}')" style="position:static; margin-left:auto; width:30px; height:30px; display:flex; align-items:center; justify-content:center;" aria-label="Bookmark ${cut.name}">
                            <i data-lucide="bookmark" style="width:14px; height:14px;"></i>
                        </button>
                    </div>
                    <p style="font-size:0.85rem; color:var(--color-text-secondary); line-height:1.4; margin:0;">${cut.shortDesc}</p>
                    <div style="display:flex; gap:10px; align-items:center; margin-top:4px;">
                        <span class="spec-badge" style="font-size:0.65rem; color:${diffColor}; border-color:${diffColor}44; padding:2px 6px;">
                            <span>${cut.difficulty} Build</span>
                        </span>
                        <button class="btn-card-action" style="width:auto; margin:0; padding:4px 12px; font-size:0.75rem;" onclick="openStyleDetails('${cut.id}')">
                            <span>How to Style</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    const profileHtml = `
        <div class="shape-profile-container animate-fade-in" style="grid-column: 1 / -1; display: grid; grid-template-columns: 360px 1fr; gap: 30px; width:100%;">
            <!-- Left Column: PDF Text Info Card -->
            <div class="glass-card" style="display: flex; flex-direction: column; gap: 20px; height: fit-content; position: sticky; top: 100px;">
                <div style="display: flex; align-items: center; gap: 15px; border-bottom: 1px solid var(--color-border); padding-bottom: 15px;">
                    <div style="width: 70px; height: 84px; background: rgba(255,255,255,0.4); padding:6px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center;">
                        ${shape.svgPath}
                    </div>
                    <div>
                        <h3 class="style-title" style="font-size:1.35rem; margin-bottom:4px; color:var(--color-text-primary);">${shape.title}</h3>
                        <span class="measurements-pill" style="font-size:0.7rem; padding:4px 10px;">${shape.ratio}</span>
                    </div>
                </div>
                
                <div>
                    <h4 style="font-size:0.85rem; font-weight:700; margin-bottom:6px; text-transform:uppercase; color:var(--color-text-muted);">PDF Description</h4>
                    <p style="font-size:0.9rem; color:var(--color-text-secondary); line-height:1.5;">${shape.description}</p>
                </div>
                
                <div class="tip-pill goal-pill" style="flex-direction:column; align-items:flex-start; gap:6px;">
                    <div style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:0.8rem; text-transform:uppercase;">
                        <i data-lucide="sparkles" style="width:16px; height:16px;"></i>
                        <span>Barber Strategy</span>
                    </div>
                    <span style="font-size:0.85rem; line-height:1.4;">${shape.goal}</span>
                </div>
                
                <div class="tip-pill avoid-pill" style="flex-direction:column; align-items:flex-start; gap:6px;">
                    <div style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:0.8rem; text-transform:uppercase;">
                        <i data-lucide="ban" style="width:16px; height:16px;"></i>
                        <span>What to Avoid</span>
                    </div>
                    <span style="font-size:0.85rem; line-height:1.4;">${shape.avoid}</span>
                </div>
            </div>
            
            <!-- Right Column: Haircut List -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <h3 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:700; margin-bottom:4px; color:var(--color-text-primary);">Recommended Cuts from PDF</h3>
                <div style="display:flex; flex-direction:column; gap:16px;">
                    ${cutsHtml}
                </div>
            </div>
        </div>
    `;
    
    catalogGrid.className = 'catalog-grid-profile-layout';
    catalogGrid.innerHTML = profileHtml;
    lucide.createIcons();
}

window.selectShapeFilter = function(shapeId) {
    document.getElementById('shape-filter-select').value = shapeId;
    renderCatalog(shapeId);
};

// ==========================================================================
// 8. FAVORITES & PROFILE DASHBOARD RENDERER
// ==========================================================================
function updateProfileTab() {
    // Count bookmarks
    document.getElementById('stat-favorites-count').textContent = state.favorites.length;
    
    // Saved face shape text
    const shapeLabel = document.getElementById('stat-face-shape');
    if (state.faceShape) {
        shapeLabel.textContent = FACE_SHAPES_DATA[state.faceShape].title;
        shapeLabel.style.color = 'var(--color-primary)';
    } else {
        shapeLabel.textContent = 'Not Analyzed';
        shapeLabel.style.color = 'var(--color-text-muted)';
    }
    
    // Render Favorite list cards
    const favsGrid = document.getElementById('favorites-grid');
    const noFavsMsg = document.getElementById('no-favorites-message');
    
    if (state.favorites.length === 0) {
        noFavsMsg.classList.remove('hidden');
        // Clear remaining cards
        const cards = favsGrid.querySelectorAll('.style-card');
        cards.forEach(c => c.remove());
        return;
    }
    
    noFavsMsg.classList.add('hidden');
    
    // Fetch detailed objects
    let favsHtml = '';
    state.favorites.forEach(id => {
        const style = HAIRSTYLES_DATA.find(h => h.id === id);
        if (style) {
            const shapesText = style.suitableShapes.map(s => FACE_SHAPES_DATA[s]?.title || s).join(', ');
            const diffColor = style.difficulty === 'Easy' ? '#86efac' : style.difficulty === 'Medium' ? '#fde047' : '#fca5a5';
            
            favsHtml += `
                <div class="style-card animate-fade-in-up">
                    <div class="style-image-wrapper" style="height: 150px">
                        <img class="style-card-image" src="assets/${style.imageId}.png" alt="${style.name}" style="background:#ffffff; object-fit:contain; width:100%; height:100%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="style-image-placeholder" style="display: none; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                            <i data-lucide="scissors" style="width:24px; height:24px"></i>
                            <span style="font-size:0.75rem">${style.name}</span>
                        </div>
                        <button class="favorite-btn active" onclick="toggleFavorite(event, '${style.id}')">
                            <i data-lucide="bookmark"></i>
                        </button>
                    </div>
                    <div class="style-card-details" style="padding: 15px; gap: 8px;">
                        <h3 class="style-title" style="font-size:1rem">${style.name}</h3>
                        <div class="card-spec-row">
                            <span class="spec-badge" style="color:${diffColor}; border-color:${diffColor}44; padding:2px 6px; font-size:0.65rem">
                                <span>${style.difficulty}</span>
                            </span>
                        </div>
                        <button class="btn-card-action" style="padding: 6px; font-size: 0.78rem" onclick="openStyleDetails('${style.id}')">
                            <span>How to Style</span>
                        </button>
                    </div>
                </div>
            `;
        }
    });
    
    // Prepend the new cards, keeping the no-favorites message hidden
    favsGrid.innerHTML = `
        <div class="no-favorites hidden" id="no-favorites-message">
            <i data-lucide="bookmark" class="no-fav-icon"></i>
            <p>You haven\'t bookmarked any hairstyles yet. Browse the Catalog and tap the bookmark icon to save styles here!</p>
        </div>
        ${favsHtml}
    `;
    
    lucide.createIcons();
}

// ==========================================================================
// 9. DETAILS OVERLAY MODAL MANAGER
// ==========================================================================
window.openStyleDetails = function(styleId) {
    const style = HAIRSTYLES_DATA.find(h => h.id === styleId);
    if (!style) return;
    
    const modalContent = document.getElementById('modal-body-content');
    
    // Map list of steps
    let stepsHtml = '';
    style.steps.forEach((step, idx) => {
        stepsHtml += `
            <div class="modal-step-row">
                <div class="step-number">${idx + 1}</div>
                <div class="step-text">${step}</div>
            </div>
        `;
    });
    
    modalContent.innerHTML = `
        <div class="modal-header-section">
            <span class="suitability-badge">Matches: ${style.suitableShapes.map(s => FACE_SHAPES_DATA[s]?.title || s).join(', ')}</span>
            <h2 class="section-title gradient-text">${style.name}</h2>
        </div>
        
        <div class="modal-image-wrapper">
            <img src="assets/${style.imageId}.png" alt="${style.name}" style="width:100%; height:100%; object-fit:contain; background:#ffffff;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="style-image-placeholder" style="height:100%; display:none; flex-direction:column; align-items:center; justify-content:center;">
                <i data-lucide="scissors" style="width:48px; height:48px; color:var(--color-primary);"></i>
                <div style="font-family:var(--font-heading); font-weight:700; font-size:1.1rem; color:var(--color-text-primary);">${style.name}</div>
                <p style="color:var(--color-text-muted)">Visual styling chart matches your profile details</p>
            </div>
        </div>

        <div class="modal-specs">
            <div class="modal-spec-item">
                <span class="modal-spec-label">Styling Product</span>
                <span class="modal-spec-value">${style.product}</span>
            </div>
            <div class="modal-spec-item">
                <span class="modal-spec-label">Build Difficulty</span>
                <span class="modal-spec-value">${style.difficulty}</span>
            </div>
            <div class="modal-spec-item">
                <span class="modal-spec-label">Required Upkeep</span>
                <span class="modal-spec-value">${style.maintenance}</span>
            </div>
        </div>

        <div class="modal-desc-title">Grooming Overview</div>
        <p class="modal-desc-text">${style.desc}</p>

        <div class="modal-desc-title" style="margin-bottom: 15px;">Step-by-Step Styling Tutorial</div>
        <div class="modal-steps-list">
            ${stepsHtml}
        </div>
    `;
    
    // Open Modal
    document.getElementById('style-modal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
    
    lucide.createIcons();
};

function closeModal() {
    document.getElementById('style-modal').classList.remove('active');
    document.body.style.overflow = 'auto'; // Unlock background scrolling
}

// ==========================================================================
// 10. VIRTUAL TRY-ON ("Try Hair") CONTROLLER LOGIC
// ==========================================================================

// Global initialization of Try Hair view
function initTryonView() {
    renderTryonStyleCarousel();
    initiateCameraAccess(true); // Attempt silent auto-start
    setupTryonSliders();
    setupTryonGestures();
    setupTryonActions();
}

// Render the horizontal hairstyle filter icons list
function renderTryonStyleCarousel() {
    const carousel = document.getElementById('tryon-style-carousel');
    if (!carousel) return;
    
    // Generate distinct haircuts list (unique by imageId to prevent duplicate overlays)
    const uniqueStyles = [];
    const seenIds = new Set();
    
    HAIRSTYLES_DATA.forEach(style => {
        if (!seenIds.has(style.imageId)) {
            seenIds.add(style.imageId);
            uniqueStyles.push(style);
        }
    });
    
    let html = '';
    uniqueStyles.forEach(style => {
        const isActive = style.imageId === state.tryon.activeHairId ? 'active' : '';
        html += `
            <div class="carousel-item ${isActive}" data-image-id="${style.imageId}" onclick="selectTryonHairstyle('${style.imageId}')">
                <img class="carousel-img" src="assets/${style.imageId}.png" alt="${style.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%221%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>'">
                <span class="carousel-name">${style.name}</span>
            </div>
        `;
    });
    
    carousel.innerHTML = html;
}

// Select style in virtual mirror
window.selectTryonHairstyle = function(imageId) {
    state.tryon.activeHairId = imageId;
    
    // Update active class in list items
    document.querySelectorAll('.carousel-item').forEach(item => {
        if (item.getAttribute('data-image-id') === imageId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update overlay image src
    const imgEl = document.getElementById('tryon-hair-image');
    if (imgEl) {
        imgEl.src = `assets/${imageId}.png`;
    }
};

// Start camera stream
window.initiateCameraAccess = function(silent = false) {
    const video = document.getElementById('tryon-video');
    const statusPrompt = document.getElementById('camera-status-prompt');
    if (!video) return;
    
    // Stop any existing stream before restarting
    stopTryonCamera();
    
    const constraints = {
        video: {
            facingMode: state.tryon.facingMode,
            width: { ideal: 640 },
            height: { ideal: 850 }
        },
        audio: false
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            state.tryon.stream = stream;
            video.srcObject = stream;
            
            // Adjust mirroring
            if (state.tryon.facingMode === 'environment') {
                video.classList.add('environment-mode');
            } else {
                video.classList.remove('environment-mode');
            }
            
            if (statusPrompt) statusPrompt.style.display = 'none';
        })
        .catch(err => {
            console.error('Camera access error:', err);
            if (!silent && statusPrompt) {
                statusPrompt.innerHTML = `
                    <i data-lucide="camera-off" style="width:48px; height:48px; color:var(--color-rose);"></i>
                    <p>Camera access denied or unavailable. Please check website permissions.</p>
                    <button class="btn-primary" onclick="initiateCameraAccess()">Retry Access</button>
                `;
                lucide.createIcons();
            }
        });
};

// Stop webcam stream to save system memory
function stopTryonCamera() {
    if (state.tryon.stream) {
        state.tryon.stream.getTracks().forEach(track => track.stop());
        state.tryon.stream = null;
    }
    const video = document.getElementById('tryon-video');
    if (video) video.srcObject = null;
    
    const statusPrompt = document.getElementById('camera-status-prompt');
    if (statusPrompt) statusPrompt.style.display = 'flex';
}

// Adjust transformations values
function updateHairTransform() {
    const hair = document.getElementById('tryon-hair-image');
    if (!hair) return;
    
    hair.style.transform = `translate(${state.tryon.posX}px, ${state.tryon.posY}px) scale(${state.tryon.scale}) rotate(${state.tryon.rotate}deg)`;
    
    // Update labels
    document.getElementById('val-scale').textContent = `${state.tryon.scale.toFixed(2)}x`;
    document.getElementById('val-rotate').textContent = `${state.tryon.rotate}°`;
    document.getElementById('val-posx').textContent = `${state.tryon.posX}px`;
    document.getElementById('val-posy').textContent = `${state.tryon.posY}px`;
}

// Bind sliders events
function setupTryonSliders() {
    const sScale = document.getElementById('slider-scale');
    const sRotate = document.getElementById('slider-rotate');
    const sPosX = document.getElementById('slider-posx');
    const sPosY = document.getElementById('slider-posy');
    
    if (sScale) {
        sScale.value = state.tryon.scale;
        sScale.oninput = (e) => {
            state.tryon.scale = parseFloat(e.target.value);
            updateHairTransform();
        };
    }
    
    if (sRotate) {
        sRotate.value = state.tryon.rotate;
        sRotate.oninput = (e) => {
            state.tryon.rotate = parseInt(e.target.value);
            updateHairTransform();
        };
    }
    
    if (sPosX) {
        sPosX.value = state.tryon.posX;
        sPosX.oninput = (e) => {
            state.tryon.posX = parseInt(e.target.value);
            updateHairTransform();
        };
    }
    
    if (sPosY) {
        sPosY.value = state.tryon.posY;
        sPosY.oninput = (e) => {
            state.tryon.posY = parseInt(e.target.value);
            updateHairTransform();
        };
    }
    
    updateHairTransform();
}

// Touch and drag gesture calculations for portable mobile usage
function setupTryonGestures() {
    const hair = document.getElementById('tryon-hair-image');
    const container = document.getElementById('tryon-overlay-container');
    if (!hair || !container) return;
    
    // Mouse Events
    hair.addEventListener('mousedown', (e) => {
        state.tryon.isDragging = true;
        state.tryon.dragStartX = e.clientX;
        state.tryon.dragStartY = e.clientY;
        state.tryon.hairStartX = state.tryon.posX;
        state.tryon.hairStartY = state.tryon.posY;
        e.preventDefault();
    });
    
    window.addEventListener('mousemove', (e) => {
        if (!state.tryon.isDragging) return;
        const deltaX = e.clientX - state.tryon.dragStartX;
        const deltaY = e.clientY - state.tryon.dragStartY;
        
        state.tryon.posX = state.tryon.hairStartX + deltaX;
        state.tryon.posY = state.tryon.hairStartY + deltaY;
        
        // Sync to sliders
        document.getElementById('slider-posx').value = state.tryon.posX;
        document.getElementById('slider-posy').value = state.tryon.posY;
        
        updateHairTransform();
    });
    
    window.addEventListener('mouseup', () => {
        state.tryon.isDragging = false;
    });

    // Mobile Touch Events (Single-touch dragging)
    hair.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            state.tryon.isDragging = true;
            state.tryon.dragStartX = e.touches[0].clientX;
            state.tryon.dragStartY = e.touches[0].clientY;
            state.tryon.hairStartX = state.tryon.posX;
            state.tryon.hairStartY = state.tryon.posY;
        }
        e.preventDefault();
    });

    hair.addEventListener('touchmove', (e) => {
        if (!state.tryon.isDragging || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - state.tryon.dragStartX;
        const deltaY = e.touches[0].clientY - state.tryon.dragStartY;
        
        state.tryon.posX = state.tryon.hairStartX + deltaX;
        state.tryon.posY = state.tryon.hairStartY + deltaY;
        
        // Sync sliders
        document.getElementById('slider-posx').value = state.tryon.posX;
        document.getElementById('slider-posy').value = state.tryon.posY;
        
        updateHairTransform();
    });

    hair.addEventListener('touchend', () => {
        state.tryon.isDragging = false;
    });
}

// Bind flip/reset buttons and capture snapshot
function setupTryonActions() {
    const btnFlip = document.getElementById('btn-flip-camera');
    const btnReset = document.getElementById('btn-reset-tryon');
    const btnCapture = document.getElementById('btn-capture-snapshot');
    
    if (btnFlip) {
        btnFlip.onclick = () => {
            state.tryon.facingMode = state.tryon.facingMode === 'user' ? 'environment' : 'user';
            initiateCameraAccess();
        };
    }
    
    if (btnReset) {
        btnReset.onclick = () => {
            state.tryon.scale = 1.0;
            state.tryon.rotate = 0;
            state.tryon.posX = 0;
            state.tryon.posY = 0;
            
            document.getElementById('slider-scale').value = 1.0;
            document.getElementById('slider-rotate').value = 0;
            document.getElementById('slider-posx').value = 0;
            document.getElementById('slider-posy').value = 0;
            
            updateHairTransform();
        };
    }
    
    if (btnCapture) {
        btnCapture.onclick = takeTryonSnapshot;
    }
}

// Render video frame and hair overlay to a high-quality Canvas and download JPG
function takeTryonSnapshot() {
    const video = document.getElementById('tryon-video');
    const hair = document.getElementById('tryon-hair-image');
    const canvas = document.getElementById('tryon-canvas');
    const flash = document.getElementById('camera-flash-effect');
    
    if (!video || !hair || !canvas || !state.tryon.stream) return;
    
    // Play shutter flash animation
    if (flash) {
        flash.classList.remove('flash-active');
        void flash.offsetWidth; // Reflow to reset animation
        flash.classList.add('flash-active');
        setTimeout(() => flash.classList.remove('flash-active'), 500);
    }
    
    const ctx = canvas.getContext('2d');
    
    // Match canvas width/height to actual video track resolution
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 850;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    // Draw Video stream frame
    ctx.save();
    // Front camera is mirrored inside CSS, so mirror it inside canvas context too if user mode
    if (state.tryon.facingMode === 'user') {
        ctx.translate(videoWidth, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();
    
    // Draw Haircut Overlay
    // We calculate scaling ratios between video display size and actual resolution
    const displayWidth = video.offsetWidth;
    const displayHeight = video.offsetHeight;
    
    const scaleRatioX = videoWidth / displayWidth;
    const scaleRatioY = videoHeight / displayHeight;
    
    // Find current styling specs of image
    const hairWidth = hair.offsetWidth;
    const hairHeight = hair.offsetHeight;
    
    // Find centered position of overlay graphic relative to camera box
    const hairLeft = hair.offsetLeft;
    const hairTop = hair.offsetTop;
    
    // Calculate final positions
    const renderX = (hairLeft + state.tryon.posX) * scaleRatioX;
    const renderY = (hairTop + state.tryon.posY) * scaleRatioY;
    const renderWidth = hairWidth * state.tryon.scale * scaleRatioX;
    const renderHeight = hairHeight * state.tryon.scale * scaleRatioY;
    
    ctx.save();
    // Set anchor point to center of image for rotation
    const centerX = renderX + renderWidth / 2;
    const centerY = renderY + renderHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((state.tryon.rotate * Math.PI) / 180);
    
    // Draw
    ctx.drawImage(hair, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
    ctx.restore();
    
    // Trigger download
    try {
        const link = document.createElement('a');
        link.download = `findo-tryon-${state.tryon.activeHairId}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
    } catch (e) {
        console.error('Error generating photo data url:', e);
    }
}
