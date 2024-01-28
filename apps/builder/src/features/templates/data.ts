import { TemplateProps } from './types'

export const templates: TemplateProps[] = [
  {
    name: 'Lead Generation',
    emoji: '🤝',
    fileName: 'lead-gen.json',
    category: 'marketing',
    description:
      'You are a marketing agency and this bot allows you generate new leads interested in your services',
  },
  {
    name: 'Customer Support',
    emoji: '😍',
    fileName: 'customer-support.json',
    category: 'product',
    description:
      'A bot whose job is to collect user feedback: questions, bugs and feature requests.',
  },
  {
    name: 'Quiz',
    emoji: '🕹️',
    fileName: 'quiz.json',
    category: 'marketing',
    description:
      'A fun quizz to engage with your users and collect their emails',
  },
  {
    name: 'Lead Scoring',
    emoji: '🏆',
    fileName: 'lead-scoring.json',
    category: 'marketing',
    description:
      'Compute a score alongside lead qualification questions to rank your new prospects',
  },
  {
    name: 'Lead magnet',
    emoji: '🧲',
    fileName: 'lead-magnet.json',
    category: 'marketing',
    description:
      'Provide a free content to your prospects in exchange for their contact information.',
  },
  {
    name: 'Product recommendation',
    emoji: '🍫',
    fileName: 'product-recommendation.json',
    category: 'marketing',
    description:
      'Näak is a company that sells energy bars, hydration mix and recovery prodcuts. This bot helps a visitor choosing the right product. It helps you qualify your lead and provide a personalized recommendation.',
    backgroundColor: '#010000',
  },
  {
    name: 'NPS Survey',
    emoji: '⭐',
    fileName: 'nps.json',
    category: 'product',
    description:
      'A simple NPS survey to measure your customer satisfaction and improve your product',
  },
  {
    name: 'User Onboarding',
    emoji: '🧑‍🚀',
    fileName: 'onboarding.json',
    category: 'product',
    description:
      'A bot that asks for new user information before he start using your product',
  },
  {
    name: 'Digital Product Payment',
    emoji: '🖼️',
    fileName: 'digital-product-payment.json',
    description:
      'A bot that allows you to sell digital products (ebooks, courses, etc.) and only provide the content after the payment is confirmed',
  },
  {
    name: 'FAQ',
    emoji: '💬',
    fileName: 'faq.json',
    category: 'product',
    description:
      'A bot that answers frequently asked questions about your product or service',
  },
  {
    name: 'Movie Recommendation',
    emoji: '🍿',
    fileName: 'movie-recommendation.json',
    description: 'A bot that recommends movies based on the user preferences',
  },
  {
    name: 'Basic ChatGPT',
    emoji: '🤖',
    fileName: 'basic-chat-gpt.json',
    description:
      'A bot that uses the ChatGPT model to generate responses based on the user input',
  },
  {
    name: 'Audio ChatGPT',
    emoji: '🤖',
    fileName: 'audio-chat-gpt.json',
    description:
      'An audio AI bot that uses the OpenAI block to generate responses based on the user input',
    isNew: true,
  },
  {
    name: 'ChatGPT personas',
    emoji: '🎭',
    fileName: 'chat-gpt-personas.json',
    description:
      'A bot that uses the ChatGPT model to generate responses based on the user input and the selected persona',
  },
  {
    name: 'Lead Gen with AI',
    emoji: '🦾',
    fileName: 'lead-gen-ai.json',
    category: 'marketing',
    description:
      'You are a marketing agency and this bot allows you generate new leads interested in your services. An AI block is used to dig deeper into the user needs.',
  },
  {
    name: 'Insurance offer',
    emoji: '🐶',
    fileName: 'dog-insurance-offer.json',
    category: 'marketing',
    description:
      'You are a dog insurance company. This bot allows you to collect information about the dog and provide a quote.',
  },
  {
    name: 'OpenAI conditions',
    emoji: '🧠',
    fileName: 'openai-conditions.json',
    isNew: true,
    description:
      'This is an example of how you can use the OpenAI block to take smart decisions based on the user input and redirect the conversation to the right path.',
  },
]
