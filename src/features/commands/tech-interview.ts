import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { techInterviewService } from '../tech-interview/index.js';
import { TechInterviewAnswer, SystemDesignConcept } from '../tech-interview/types.js';

// Type guard functions
function isTechInterviewAnswer(content: TechInterviewAnswer | SystemDesignConcept): content is TechInterviewAnswer {
  return 'definition' in content;
}

function isSystemDesignConcept(content: TechInterviewAnswer | SystemDesignConcept): content is SystemDesignConcept {
  return 'requirementsGathering' in content;
}

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

      // Get random content (either TechInterviewAnswer or SystemDesignConcept)
      const techContent = techInterviewService.getRandomTechContent();

      // Helper function to format arrays as bullet points
      const formatBulletPoints = (items: string[]): string => {
        return items.map(item => `• ${item}`).join('\n');
      };

      // Create the main embed with the structured answer
      const embed = new EmbedBuilder()
        .setTitle('💻 Technical Interview Practice')
        .setDescription(`**Question:** ${techContent.question}`)
        .setColor(0x2ecc71)
        .setTimestamp()
        .setFooter({
          text: 'Practice structured technical interview responses 🚀',
          iconURL: interaction.user.displayAvatarURL(),
        });

      // Handle different content types
      if (isTechInterviewAnswer(techContent)) {
        // Traditional tech interview answer format
        embed.addFields(
          {
            name: '**📌 Definition / Concept**',
            value: formatBulletPoints(techContent.definition),
            inline: false,
          },
          {
            name: '**🔍 Key Characteristics / Differences**',
            value: formatBulletPoints(techContent.keyCharacteristics),
            inline: false,
          }
        );

        // Add advantages/disadvantages if they exist
        if (techContent.advantages && techContent.disadvantages) {
          embed.addFields({
            name: '**⚖️ Advantages / Disadvantages**',
            value: `**Advantages:**\n${formatBulletPoints(techContent.advantages)}\n\n**Disadvantages:**\n${formatBulletPoints(techContent.disadvantages)}`,
            inline: false,
          });
        }

        embed.addFields(
          {
            name: '**💡 Practical Example**',
            value: formatBulletPoints(techContent.practicalExample),
            inline: false,
          },
          {
            name: '**✅ Best Practices / When to Use**',
            value: formatBulletPoints(techContent.bestPractices),
            inline: false,
          },
          {
            name: '**🎯 Conclusion / Summary**',
            value: formatBulletPoints(techContent.conclusion),
            inline: false,
          }
        );
      } else if (isSystemDesignConcept(techContent)) {
        // System design concept format
        embed.addFields(
          {
            name: '**📋 Requirements Gathering**',
            value: formatBulletPoints(techContent.requirementsGathering),
            inline: false,
          },
          {
            name: '**⚙️ Functional Requirements**',
            value: formatBulletPoints(techContent.functionalRequirements),
            inline: false,
          },
          {
            name: '**📊 Non-Functional Requirements**',
            value: formatBulletPoints(techContent.nonFunctionalRequirements),
            inline: false,
          },
          {
            name: '**📏 Capacity Estimation**',
            value: formatBulletPoints(techContent.capacityEstimation),
            inline: false,
          },
          {
            name: '**🏗️ High-Level Design**',
            value: formatBulletPoints(techContent.highLevelDesign),
            inline: false,
          },
          {
            name: '**🔧 Detailed Design**',
            value: formatBulletPoints(techContent.detailedDesign),
            inline: false,
          },
          {
            name: '**💾 Database Design**',
            value: formatBulletPoints(techContent.databaseDesign),
            inline: false,
          },
          {
            name: '**🔌 API Design**',
            value: formatBulletPoints(techContent.apiDesign),
            inline: false,
          },
          {
            name: '**📈 Scaling Strategy**',
            value: formatBulletPoints(techContent.scalingStrategy),
            inline: false,
          },
          {
            name: '**📊 Monitoring**',
            value: formatBulletPoints(techContent.monitoring),
            inline: false,
          },
          {
            name: '**⚖️ Trade-offs**',
            value: formatBulletPoints(techContent.tradeoffs),
            inline: false,
          }
        );
      }

      await interaction.editReply({ embeds: [embed] });

      // Send follow-up with the answer structure guide based on content type
      let guideEmbed: EmbedBuilder;
      
      if (isTechInterviewAnswer(techContent)) {
        guideEmbed = new EmbedBuilder()
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
          );
      } else {
        guideEmbed = new EmbedBuilder()
          .setTitle('🏗️ System Design Interview Structure')
          .setDescription(
            'When answering "How would you design ~~ service?" questions, follow this systematic approach:'
          )
          .setColor(0x3498db)
          .addFields(
            {
              name: '**1. Requirements Gathering**',
              value: 'Clarify scope, scale, and key constraints. Ask questions about expected usage.',
              inline: false,
            },
            {
              name: '**2. Functional & Non-Functional Requirements**',
              value: 'Define what the system should do and performance/reliability expectations.',
              inline: false,
            },
            {
              name: '**3. Capacity Estimation**',
              value: 'Calculate storage, QPS, bandwidth needs. Show your math.',
              inline: false,
            },
            {
              name: '**4. High-Level Design**',
              value: 'Draw the major components and their relationships. Keep it simple first.',
              inline: false,
            },
            {
              name: '**5. Detailed Design**',
              value: 'Dive deeper into critical components, algorithms, and data flow.',
              inline: false,
            },
            {
              name: '**6. Database & API Design**',
              value: 'Choose appropriate storage solutions and define key APIs.',
              inline: false,
            },
            {
              name: '**7. Scaling & Monitoring**',
              value: 'Discuss bottlenecks, scaling strategies, and key metrics to track.',
              inline: false,
            },
            {
              name: '**8. Trade-offs**',
              value: 'Acknowledge limitations and alternative approaches. Show critical thinking.',
              inline: false,
            }
          );
      }

      guideEmbed.addFields({
        name: '🎯 Practice Tip',
        value: `Try answering the question above using this structure before looking at the model answer! (${techInterviewService.getTotalCount()} questions available)`,
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
