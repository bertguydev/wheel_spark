export const DRAWING_AGES = ["5–7", "8–10", "11–12"] as const;
export const DRAWING_DURATIONS = [
  { minutes: 3, name: "Quick sketch" },
  { minutes: 5, name: "Creative challenge" },
  { minutes: 10, name: "Detailed drawing" },
] as const;

export type DrawingAge = (typeof DRAWING_AGES)[number];
export type DrawingMinutes = (typeof DRAWING_DURATIONS)[number]["minutes"];
export type DrawingSettings = { age: DrawingAge; minutes: DrawingMinutes };
export const DEFAULT_DRAWING_SETTINGS: DrawingSettings = { age: "8–10", minutes: 5 };

type Directions = Record<DrawingAge, string>;
type DirectionRow = readonly [prompt: string, young: string, middle: string, older: string];

// Keep these keyed by the existing labels so saved and shared wheels need no migration.
const rows: readonly DirectionRow[] = [
  ["Frog wearing a crown", "Draw a round frog with two big eyes and a zigzag crown.", "Design a crown for a frog and draw its favorite spot in the pond.", "Draw a frog's coronation from lily-pad level. Use the other pond creatures' faces to show how they feel."],
  ["Cozy treehouse", "Draw a box in a tree. Add a ladder and a little window.", "Give your treehouse a way up and add something cozy inside or on the porch.", "Show both the outside and inside of a treehouse in a cutaway. Design it for someone with a secret hobby."],
  ["Astronaut with a kite", "Draw a round helmet and a diamond kite. Join them with a wiggly string.", "Draw an astronaut flying a kite over moon rocks. Design a pattern for the kite.", "Invent a way for a kite to fly where there is no wind. Show how it works in your space scene."],
  ["Sleepy dragon", "Draw a curled-up dragon with closed eyes and a tiny puff of smoke.", "Give your dragon a comfy bed and show what it dreams about in a bubble.", "Use the curve of the dragon's body to lead the eye to its face. Leave clues about what wore it out."],
  ["Mushroom village", "Draw three mushroom houses with round tops and tiny doors.", "Connect mushroom homes with paths. Give each home a different job or owner.", "Draw a mushroom village from a beetle's point of view. Use overlapping buildings to show depth."],
  ["Robot cooking dinner", "Draw a boxy robot holding a spoon. Add a pot of its favorite food.", "Design a cooking tool for each of the robot's hands and add food to its kitchen.", "Show a dinner mishap mid-action. Use the robot's pose and flying ingredients to tell the story."],
  ["Underwater castle", "Draw two towers with triangle roofs. Add bubbles and a fish.", "Choose what the castle is made of and draw who guards its underwater gate.", "Use light and shadow to show how deep the castle sits. Give a visitor a reason to approach its gates."],
  ["Haunted house", "Draw a crooked roof and give the windows silly faces.", "Set the house in a spooky or funny yard. Put a surprise in one window.", "Use shadows and a tilted viewpoint to build suspense. Add one small clue that changes the mood."],
  ["Cat in a cardboard box", "Draw a box with two pointy ears and a tail sticking out.", "Turn the box into something the cat imagines, and add a label or decoration.", "Show what the cat believes the box is and what everyone else sees in one picture."],
  ["Tiny island", "Draw an oval of sand, one tree, and wavy lines for water.", "Give your island one unusual landmark. Draw a way someone could get there.", "Draw a tiny island from above. Use the paths and shore to hint at who lives there and what they do."],
  ["Monster delivering mail", "Draw a friendly monster with a mailbag and a big envelope.", "Invent a mailbag that fits your monster and draw the house getting a delivery.", "Capture an unexpected delivery. Show how the monster and the person opening the door react differently."],
  ["Wizard's desk", "Draw a table with a star wand and a bubbly bottle on top.", "Draw three magical objects on the desk. Make one of them do something surprising.", "Draw the desk from above. Arrange the objects as clues to a spell that just went wrong."],
  ["Snail with a garden", "Draw a spiral shell and plant three flowers beside your snail.", "Draw what grows in the snail's garden. Give it a tiny tool to care for the plants.", "Show the garden at snail height. Use huge leaves and tiny details to make the snail feel small."],
  ["Moonlit campsite", "Draw a triangle tent under a big moon. Add a few stars.", "Draw a campsite at night. Pick one thing for the moon to light up.", "Use moonlight and a campfire as two light sources. Hint at a story beyond the edge of the campsite."],
  ["Coffee mug", "Draw a cup with a loop handle and curl some steam above it.", "Design a pattern for the mug and draw something beside it that goes with the drink.", "Sketch the mug from a low angle. Use highlights and a cast shadow to show its shape and material."],
  ["Houseplant", "Draw a pot with tall stems and leaves shaped like ovals.", "Invent a leaf pattern and draw where your plant lives in the room.", "Draw a plant bending toward a window. Use its shape and shadows to show where the light comes from."],
  ["Mushroom", "Draw an umbrella shape on a short stem. Add dots to the top.", "Give your mushroom a color pattern and show what grows around it.", "Draw a mushroom from below, showing the lines under its cap and the world just beyond it."],
  ["Sneaker", "Draw a shoe with a flat sole and make zigzags for the laces.", "Design a sneaker for a special activity and add a logo or tread pattern.", "Design a sneaker for an unusual place. Show it in action so the design choices make sense."],
  ["Bicycle", "Start with two circles for wheels. Join them with lines and add a seat.", "Draw a bike with a basket or bell and give it somewhere fun to ride.", "Draw a bike turning a corner. Use the rider's pose and the angle of the wheels to suggest movement."],
  ["Lighthouse", "Draw a tall tower with a little roof and a bright beam.", "Give the lighthouse a stripe pattern and draw what its light helps a boat avoid.", "Build a stormy scene around the lighthouse. Use its beam to guide the eye to a boat in trouble."],
  ["Backpack", "Draw a rounded bag with straps and a big front pocket.", "Design a backpack for a trip and show two things poking out of it.", "Draw an open backpack so its contents tell us where the owner has been and where they're going."],
  ["Cupcake", "Draw a wrapper and pile round scoops of frosting on top.", "Invent a cupcake flavor. Use colors, toppings, and a wrapper to give clues.", "Draw a close-up of a cupcake with a bite missing. Use textures to show its different layers."],
  ["Sunglasses", "Draw two big shapes for lenses and join them with a little bridge.", "Invent a frame shape and draw something fun reflected in the lenses.", "Use the two lenses to show different parts of a scene. Let the reflections reveal something outside the picture."],
  ["Hot-air balloon", "Draw a big round balloon above a little basket. Connect them with lines.", "Design a pattern for the balloon and draw what the riders can see below.", "Show balloons at three distances over a landscape. Use size and overlap to make the view feel deep."],
  ["Camera", "Draw a rectangle with a big circle for the lens and a button on top.", "Decorate a camera and draw a small picture of what it just photographed.", "Draw a camera and its latest photo. Use the difference between the photo and the wider scene to tell a story."],
  ["Cozy cabin", "Draw a square with a triangle roof. Add a warm window and a chimney.", "Give the cabin a comfy porch and draw the kind of weather outside.", "Use the warm windows and the outdoor light to set a mood. Add tracks or footprints that tell a story."],
  ["Fox", "Draw pointy ears and a big fluffy tail with a light tip.", "Draw a fox on the move. Pick a place for it to explore and add paw prints.", "Show a fox nearly hidden in its surroundings. Use color and shape to make it blend in."],
  ["Owl", "Draw an oval body, two round eyes, and a little triangle beak.", "Perch your owl on a branch and give its feathers a pattern.", "Draw an owl swooping toward something out of view. Use its wings and the background to show movement."],
  ["Frog", "Draw a round body, two eyes on top, and bent back legs.", "Draw a frog at the edge of a pond and show what it might leap toward.", "Freeze a frog in mid-leap. Use ripples, splashes, and its stretched legs to show the path it took."],
  ["Octopus", "Draw a round head and count eight curly arms.", "Give several arms different jobs and draw the octopus a hiding place.", "Use overlapping arms to show depth. Draw an underwater problem the octopus can solve with its arms."],
  ["Whale", "Draw a big curved body, a wide tail, and a little spout.", "Show a whale coming up for air. Add something nearby to show how big it is.", "Split your picture at the waterline. Show how the whale looks different above and below the surface."],
  ["Raccoon", "Draw a face with a dark eye mask and add a striped tail.", "Draw a raccoon finding something shiny. Choose where it is looking.", "Draw a nighttime scene with a raccoon caught in a beam of light. Use its pose to show what happens next."],
  ["Penguin", "Draw an oval with a light belly, two flippers, and little feet.", "Show a penguin doing something on the ice. Give it a friend or a trail.", "Draw a penguin sliding toward the water. Use the angle of the ice and scattered snow to show speed."],
  ["Axolotl", "Draw a wide smile, a long tail, and feathery bits on both sides of its head.", "Draw an axolotl drifting by water plants. Add color to its feathery gills.", "Show an axolotl from the side with its gills fanned out. Use plants and bubbles to suggest the water's movement."],
  ["Turtle", "Draw a dome for the shell and peek a head and four feet out.", "Create a pattern for the shell and draw where your turtle is headed.", "Draw a turtle facing an obstacle. Show its slow progress with marks it leaves behind."],
  ["Red panda", "Draw round ears, light cheeks, and a long striped tail.", "Draw a red panda balancing on a branch. Add leaves and show how its tail helps.", "Frame a red panda with branches at different distances. Use its pose to show how it balances."],
  ["Gecko", "Draw a little lizard with wide toes and a curved tail.", "Put your gecko on a wall and give it a pattern that helps it hide.", "Draw a gecko upside down from its own viewpoint. Show how its feet grip the surface."],
  ["Capybara", "Draw a chunky body with a big, blunt nose and tiny ears.", "Draw a capybara resting by water. Pick another animal to keep it company.", "Draw a calm capybara among busy animals. Use their poses and spacing to show the contrast."],
  ["Dragon working at a coffee shop", "Draw a dragon with an apron and a cup. Give it a little puff of steam.", "Give your dragon a shop sign and show how it makes a drink with its dragon powers.", "Draw a busy coffee counter where the dragon's fire helps with one job and causes trouble with another."],
  ["Tiny city inside a bottle", "Draw a big bottle shape with little houses and roads inside.", "Fit streets and a landmark inside the bottle. Show how people get around.", "Use reflections on the glass and the scale of objects outside the bottle to show how small the city is."],
  ["Astronaut gardening on the moon", "Draw a round helmet, a little plant, and a watering can.", "Invent a tool for growing plants on the moon. Draw the astronaut using it.", "Design a garden that could survive on the moon. Show how the astronaut protects the plants and gets them water."],
  ["Ghost afraid of the dark", "Draw a wavy ghost holding a little light. Give it worried eyes.", "Draw what startled the ghost and give it a funny way to feel brave.", "Use a small light to hide and reveal parts of the scene. Give us a clue that the ghost has misunderstood what it sees."],
  ["Robot learning to paint", "Draw a boxy robot with a paintbrush and a big splash of color.", "Show the robot's first try at painting and add what it's trying to paint nearby.", "Tell the story of a painting mistake that turns into a good idea. Show both the robot's picture and its reaction."],
  ["Castle floating in the clouds", "Draw tall towers resting on a puffy cloud.", "Add a flag and invent a way for visitors to reach your floating castle.", "Show the castle from far below. Use scale and shadows to suggest how it changes the world beneath it."],
  ["Wizard stuck in traffic", "Draw a pointy hat in a car and a line of cars ahead.", "Pick what the wizard rides and draw the spell they try to get moving again.", "Draw a traffic jam with an unexpected magical cause. Use the other travelers' reactions to tell the story."],
  ["Monster doing laundry", "Draw a fuzzy monster putting a huge sock in a basket.", "Invent clothes that fit your monster and draw what happens in the wash.", "Draw a laundry disaster in progress. Use spilled clothes and the monster's pose to show how it started."],
  ["Pirate spaceship", "Draw a rocket with a pirate flag and a window for the captain.", "Mix pirate ship parts with rocket parts. Add something the crew is searching for.", "Show a space pirate crew approaching strange treasure. Use the ship's angle and the stars to show where it's headed."],
  ["Library at the bottom of the ocean", "Draw shelves of books, bubbles, and a fish choosing a book.", "Invent a way to keep the books safe underwater. Add someone who works there.", "Show a visitor discovering the library. Use light, scale, and the entrance design to reveal how it works."],
  ["Alien visiting a grocery store", "Draw a friendly alien with a cart and its favorite snack.", "Show the alien picking up a food it has never seen. Add a funny reaction.", "Draw a grocery aisle from the alien's viewpoint. Show an everyday item being mistaken for something extraordinary."],
  ["Secret door inside a tree", "Draw a tree trunk with a little door and a special handle.", "Hide a clue near the tree that helps someone find the door. Draw a peek inside.", "Use shapes in the bark to disguise the entrance. Let a trail of clues lead the viewer from the forest to the door."],
];

const directionsByPrompt = new Map<string, Directions>(rows.map(([prompt, young, middle, older]) =>
  [prompt, { "5–7": young, "8–10": middle, "11–12": older }],
));

const customDirections: Directions = {
  "5–7": "Draw the main idea with simple shapes. Add a color or one fun detail.",
  "8–10": "Draw the main idea and choose where it belongs. Add two details that make the picture yours.",
  "11–12": "Choose an unexpected viewpoint. Arrange the main idea and its surroundings to hint at a story.",
};

const timeDirections: Record<DrawingMinutes, Directions> = {
  3: {
    "5–7": "Start with the biggest shape.",
    "8–10": "Sketch the main idea first. Leave small details for later.",
    "11–12": "Block in the biggest shapes and focus on one clue or detail.",
  },
  5: {
    "5–7": "Draw the big shapes, then add your favorite detail.",
    "8–10": "Sketch first, then add the details that show your idea best.",
    "11–12": "Plan where things go, then develop one clear focal point.",
  },
  10: {
    "5–7": "Add colors, patterns, or something beside your drawing.",
    "8–10": "Build out the background and add color or texture.",
    "11–12": "Refine the scene with light, texture, or a detail that deepens the story.",
  },
};

export function getDrawingChallenge(prompt: string, { age, minutes }: DrawingSettings) {
  const specific = directionsByPrompt.get(prompt.trim());
  return {
    instructions: (specific ?? customDirections)[age],
    timeTip: timeDirections[minutes][age],
    duration: DRAWING_DURATIONS.find((duration) => duration.minutes === minutes)!,
  };
}
