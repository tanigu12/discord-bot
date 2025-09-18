import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { DebateAnswerService } from '../debate-answer';

const debateAnswerService = new DebateAnswerService();

export const debateAnswerCommand = {
  data: new SlashCommandBuilder()
    .setName('debate-answer')
    .setDescription(
      'Get a structured model answer for debate practice with 4-step logical structure'
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      console.log(`🎭 Generating debate answer for ${interaction.user.tag}`);

      // Get a random debate question with model answer
      const debateAnswer = debateAnswerService.getRandomDebateAnswer();

      // Create the main embed with the structured answer
      const embed = new EmbedBuilder()
        .setTitle('🎭 Debate Answer Practice')
        .setDescription(`**Question:** ${debateAnswer.question}`)
        .setColor(0x9b59b6)
        .setTimestamp()
        .setFooter({
          text: 'Practice structured English debate responses 🗣️',
          iconURL: interaction.user.displayAvatarURL(),
        });

      // Add the 4-step structure
      embed.addFields(
        {
          name: '**1️⃣ State Your Opinion Clearly**',
          value: `"${debateAnswer.opinion}"`,
          inline: false,
        },
        {
          name: '**2️⃣ Give One Strong Reason**',
          value: `"${debateAnswer.strongReason}"`,
          inline: false,
        },
        {
          name: '**3️⃣ Acknowledge the Other Side**',
          value: `"${debateAnswer.acknowledgeOtherSide}"`,
          inline: false,
        },
        {
          name: '**4️⃣ Conclude with Balance**',
          value: `"${debateAnswer.conclusion}"`,
          inline: false,
        }
      );

      await interaction.editReply({ embeds: [embed] });

      // Send follow-up with the logical structure guide
      const guideEmbed = new EmbedBuilder()
        .setTitle('🔑 Logical Structure (How to Build It)')
        .setDescription(
          'When you want to answer in a debate-like way, you can follow this four-step logic:'
        )
        .setColor(0x3498db)
        .addFields(
          {
            name: '**Step 1: State your opinion clearly (Yes / No / Partly)**',
            value: 'Be direct and clear about your position from the beginning.',
            inline: false,
          },
          {
            name: '**Step 2: Give one strong reason (positive point)**',
            value: 'Support your opinion with evidence, examples, or logical reasoning.',
            inline: false,
          },
          {
            name: '**Step 3: Acknowledge the other side (weakness or opposite view)**',
            value: 'Show you understand the counterarguments or limitations of your position.',
            inline: false,
          },
          {
            name: '**Step 4: Conclude with balance or summary**',
            value: 'Bring your argument together and show how you weigh different factors.',
            inline: false,
          }
        )
        .addFields({
          name: '💡 Practice Tip',
          value:
            'Try answering the question above using this structure before looking at the model answer!',
          inline: false,
        });

      await interaction.followUp({ embeds: [guideEmbed] });

      console.log('✅ Debate answer generated successfully');
    } catch (error) {
      console.error('❌ Error generating debate answer:', error);

      // Fallback response
      const fallbackEmbed = new EmbedBuilder()
        .setTitle('🎭 Debate Practice Guide')
        .setDescription("Here's the structure for great debate answers:")
        .setColor(0xe74c3c)
        .addFields(
          {
            name: '**1️⃣ State Your Opinion Clearly**',
            value:
              'Start with a clear position: "I think...", "I believe...", or "In my opinion..."',
            inline: false,
          },
          {
            name: '**2️⃣ Give One Strong Reason**',
            value:
              'Support with evidence: "Because...", "The main reason is...", "Research shows..."',
            inline: false,
          },
          {
            name: '**3️⃣ Acknowledge the Other Side**',
            value: 'Show balance: "However...", "On the other hand...", "Critics might argue..."',
            inline: false,
          },
          {
            name: '**4️⃣ Conclude with Balance**',
            value: 'Wrap up: "Therefore...", "Overall...", "In conclusion..."',
            inline: false,
          }
        );

      await interaction.editReply({
        embeds: [fallbackEmbed],
        content: "⚠️ Having trouble getting a specific example, but here's the debate structure!",
      });
    }
  },
};
