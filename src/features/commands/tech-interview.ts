import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { techInterviewService } from '../tech-interview/index.js';

export const techInterviewCommand = {
  data: new SlashCommandBuilder()
    .setName('tech-interview')
    .setDescription(
      'Get a structured model answer for technical interview questions with detailed explanations'
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      console.log(`💻 Generating tech interview answer for ${interaction.user.tag}`);

      // Get a random tech interview question with model answer
      const techAnswer = techInterviewService.getRandomTechInterviewAnswer();

      // Create the main embed with the structured answer
      const embed = new EmbedBuilder()
        .setTitle('💻 Technical Interview Practice')
        .setDescription(`**Question:** ${techAnswer.question}`)
        .setColor(0x2ecc71)
        .setTimestamp()
        .setFooter({
          text: 'Practice structured technical interview responses 🚀',
          iconURL: interaction.user.displayAvatarURL(),
        });

      // Helper function to format arrays as bullet points
      const formatBulletPoints = (items: string[]): string => {
        return items.map(item => `• ${item}`).join('\n');
      };

      // Add the extended answer structure
      embed.addFields(
        {
          name: '**📌 Definition / Concept**',
          value: formatBulletPoints(techAnswer.definition),
          inline: false,
        },
        {
          name: '**🔍 Key Characteristics / Differences**',
          value: formatBulletPoints(techAnswer.keyCharacteristics),
          inline: false,
        }
      );

      // Add advantages/disadvantages if they exist
      if (techAnswer.advantages && techAnswer.disadvantages) {
        embed.addFields({
          name: '**⚖️ Advantages / Disadvantages**',
          value: `**Advantages:**\n${formatBulletPoints(techAnswer.advantages)}\n\n**Disadvantages:**\n${formatBulletPoints(techAnswer.disadvantages)}`,
          inline: false,
        });
      }

      embed.addFields(
        {
          name: '**💡 Practical Example**',
          value: formatBulletPoints(techAnswer.practicalExample),
          inline: false,
        },
        {
          name: '**✅ Best Practices / When to Use**',
          value: formatBulletPoints(techAnswer.bestPractices),
          inline: false,
        },
        {
          name: '**🎯 Conclusion / Summary**',
          value: formatBulletPoints(techAnswer.conclusion),
          inline: false,
        }
      );

      await interaction.editReply({ embeds: [embed] });

      // Send follow-up with the answer structure guide
      const guideEmbed = new EmbedBuilder()
        .setTitle('🔧 Technical Interview Answer Structure')
        .setDescription(
          'When answering technical interview questions, follow this extended structure for comprehensive responses:'
        )
        .setColor(0x3498db)
        .addFields(
          {
            name: '**1. Definition / Concept**',
            value: 'Start with a short, clear definition. Show you know the core idea.',
            inline: false,
          },
          {
            name: '**2. Key Characteristics / Differences**',
            value: 'Explain the important details. Compare if needed (e.g., SQL vs NoSQL).',
            inline: false,
          },
          {
            name: '**3. Advantages / Disadvantages (if relevant)**',
            value: 'Show critical thinking. Mention trade-offs, not only the good side.',
            inline: false,
          },
          {
            name: '**4. Practical Example**',
            value: 'Real-world project or simple analogy. Show that you can apply knowledge.',
            inline: false,
          },
          {
            name: '**5. Best Practices / When to Use**',
            value: 'Demonstrate judgment and decision-making skills.',
            inline: false,
          },
          {
            name: '**6. Conclusion / Summary**',
            value: 'Short wrap-up, reinforce main point.',
            inline: false,
          }
        )
        .addFields({
          name: '🎯 Practice Tip',
          value: `Try answering the question above using this structure before looking at the model answer! (${techInterviewService.getQuestionCount()} questions available)`,
          inline: false,
        });

      await interaction.followUp({ embeds: [guideEmbed] });

      console.log('✅ Tech interview answer generated successfully');
    } catch (error) {
      console.error('❌ Error generating tech interview answer:', error);

      // Fallback response
      const fallbackEmbed = new EmbedBuilder()
        .setTitle('💻 Technical Interview Guide')
        .setDescription("Here's the structure for great technical interview answers:")
        .setColor(0xe74c3c)
        .addFields(
          {
            name: '**📌 Definition / Concept**',
            value: 'Start with a clear, concise definition of the concept or technology.',
            inline: false,
          },
          {
            name: '**🔍 Key Characteristics**',
            value: 'Explain the important details and distinguishing features.',
            inline: false,
          },
          {
            name: '**⚖️ Pros and Cons**',
            value: 'Show critical thinking by discussing advantages and trade-offs.',
            inline: false,
          },
          {
            name: '**💡 Practical Example**',
            value: 'Give real-world examples or analogies to demonstrate understanding.',
            inline: false,
          },
          {
            name: '**✅ Best Practices**',
            value: 'Show when and how to apply the concept effectively.',
            inline: false,
          },
          {
            name: '**🎯 Conclusion**',
            value: 'Summarize key points and demonstrate comprehensive understanding.',
            inline: false,
          }
        );

      await interaction.editReply({
        embeds: [fallbackEmbed],
        content:
          "⚠️ Having trouble getting a specific example, but here's the interview answer structure!",
      });
    }
  },
};
