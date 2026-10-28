import { SlashCommandBuilder } from "discord.js";
import { everywhere } from "../lib/install.ts";
import { pick } from "../lib/random.ts";
import type { SlashCommand } from "./types.ts";

// Carried over from the original a!randomsing.
const lyrics = [
  "Havana oh nana, half of my heart is in havana na na na",
  "Is it too late now to say sorry",
  "2+2 IS 4, MINUS 1 THATS 3 QUICK MATHS",
  "BOOM BOOM POW GONNA GET GET",
  "Despacito, nlskdnflkjkljfklsrfkljdlk burito",
  "You just want attention, you dont want my heart",
  "We were just kids when we fell, in, love, not knowing what, it, was",
  "People fall in love in mysterious ways, maybe just the touch of a hand",
  "When I see your face, theres not a thing that I would change, cause youre amazing, just the way you are",
  "Gave you all I had and you tossed it in the trash, you tossed it in the trash, you did",
  "I hear Jerusalem bells a-ringing, Roman Cavalry choirs are singing",
  "Im a barbie girl, in a barbie world",
  "从前从前有个人爱你很久，但偏偏风渐渐把距离吹得好远",
  "我一路向北，离开有你的季节",
  "转身离开，分手说不出来，海鸟跟鱼相爱，只是一场意外",
  "雨下整夜，我的爱溢出就像雨水",
  "最美的不是下雨天，是曾与你躲过雨的屋檐。",
  "也许时间是一种解药，也是我现在所服下的毒药。",
  "能不能给我一首歌的时间，紧紧的把那拥抱变成永远。",
];

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("sing")
    .setDescription("Allerion sings a random line.")
    .setIntegrationTypes(everywhere.integrationTypes)
    .setContexts(everywhere.contexts),
  async execute(interaction) {
    await interaction.reply(`🎤 *${pick(lyrics)}*`);
  },
} satisfies SlashCommand;
