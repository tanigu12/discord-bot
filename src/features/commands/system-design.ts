import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { techInterviewService } from '../tech-interview/index.js';

export const systemDesignCommand = {
  data: new SlashCommandBuilder()
    .setName('system-design')
    .setDescription(
      'Get structured answers for system design interview questions like "How would you design ~~ service?"'
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      console.log(`🏗️ Generating system design answer for ${interaction.user.tag}`);

      // Get a random system design concept
      const systemDesign = techInterviewService.getRandomSystemDesignConcept();

      // Helper function to format arrays as bullet points
      const formatBulletPoints = (items: string[]): string => {
        return items.map(item => `• ${item}`).join('\n');
      };

      // Create the main embed with the structured answer
      const embed = new EmbedBuilder()
        .setTitle('🏗️ System Design Interview Practice')
        .setDescription(`**Question:** ${systemDesign.question}`)
        .setColor(0x9b59b6)
        .setTimestamp()
        .setFooter({
          text: 'Practice systematic system design approach 🚀',
          iconURL: interaction.user.displayAvatarURL(),
        });

      // Add system design fields
      embed.addFields(
        {
          name: '**📋 Requirements Gathering**',
          value: formatBulletPoints(systemDesign.requirementsGathering),
          inline: false,
        },
        {
          name: '**⚙️ Functional Requirements**',
          value: formatBulletPoints(systemDesign.functionalRequirements),
          inline: false,
        },
        {
          name: '**📊 Non-Functional Requirements**',
          value: formatBulletPoints(systemDesign.nonFunctionalRequirements),
          inline: false,
        },
        {
          name: '**📏 Capacity Estimation**',
          value: formatBulletPoints(systemDesign.capacityEstimation),
          inline: false,
        },
        {
          name: '**🏗️ High-Level Design**',
          value: formatBulletPoints(systemDesign.highLevelDesign),
          inline: false,
        },
        {
          name: '**🔧 Detailed Design**',
          value: formatBulletPoints(systemDesign.detailedDesign),
          inline: false,
        },
        {
          name: '**💾 Database Design**',
          value: formatBulletPoints(systemDesign.databaseDesign),
          inline: false,
        },
        {
          name: '**🔌 API Design**',
          value: formatBulletPoints(systemDesign.apiDesign),
          inline: false,
        },
        {
          name: '**📈 Scaling Strategy**',
          value: formatBulletPoints(systemDesign.scalingStrategy),
          inline: false,
        },
        {
          name: '**📊 Monitoring**',
          value: formatBulletPoints(systemDesign.monitoring),
          inline: false,
        },
        {
          name: '**⚖️ Trade-offs**',
          value: formatBulletPoints(systemDesign.tradeoffs),
          inline: false,
        }
      );

      await interaction.editReply({ embeds: [embed] });

      // Send follow-up with system design guidance
      const guideEmbed = new EmbedBuilder()
        .setTitle('🏗️ System Design Interview Structure')
        .setDescription(
          'When answering "How would you design ~~ service?" questions, follow this systematic approach:'
        )
        .setColor(0x8e44ad)
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
        )
        .addFields({
          name: '🎯 Practice Tip',
          value: `Try designing the system above step-by-step before looking at the model answer! (${techInterviewService.getSystemDesignConceptCount()} system design questions available)`,
          inline: false,
        });

      await interaction.followUp({ embeds: [guideEmbed] });

      console.log('✅ System design answer generated successfully');
    } catch (error) {
      console.error('❌ Error generating system design answer:', error);

      // Fallback response
      const fallbackEmbed = new EmbedBuilder()
        .setTitle('🏗️ System Design Interview Guide')
        .setDescription("Here's the systematic approach for system design interviews:")
        .setColor(0xe74c3c)
        .addFields(
          {
            name: '**📋 Requirements Gathering**',
            value: 'Start by clarifying the problem scope and constraints.',
            inline: false,
          },
          {
            name: '**📊 Capacity Planning**',
            value: 'Estimate scale: users, data, requests per second.',
            inline: false,
          },
          {
            name: '**🏗️ High-Level Architecture**',
            value: 'Design main components and their interactions.',
            inline: false,
          },
          {
            name: '**🔧 Detailed Design**',
            value: 'Dive into critical components and algorithms.',
            inline: false,
          },
          {
            name: '**📈 Scaling & Trade-offs**',
            value: 'Discuss bottlenecks, scaling strategies, and compromises.',
            inline: false,
          }
        );

      await interaction.editReply({
        embeds: [fallbackEmbed],
        content:
          "⚠️ Having trouble getting a specific example, but here's the system design approach!",
      });
    }
  },
};