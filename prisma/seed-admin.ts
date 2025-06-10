import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding admin and blog data...')

  // Create demo admin user - Matt Haynes, Founder
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@aura.com' },
    update: {
      username: 'matth',
      name: 'Matt Haynes',
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: 'admin@aura.com',
      username: 'matth',
      password: hashedPassword,
      name: 'Matt Haynes',
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Created admin user:', admin.email, '- Matt Haynes, Founder')

  // Create sample blog categories
  const categories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'news' },
      update: {},
      create: {
        name: 'News & Updates',
        slug: 'news',
        description: 'Latest news and platform updates',
        color: '#3B82F6',
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'insights' },
      update: {},
      create: {
        name: 'Market Insights',
        slug: 'insights',
        description: 'Analysis and insights on the hospitality market',
        color: '#10B981',
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
        description: 'Blockchain and tech developments',
        color: '#8B5CF6',
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'community' },
      update: {},
      create: {
        name: 'Community',
        slug: 'community',
        description: 'Community stories and highlights',
        color: '#F59E0B',
      },
    }),
  ])

  console.log('✅ Created blog categories')

  // Create sample blog posts
  const samplePosts = [
    {
      title: 'Welcome to AURA: The Future of Decentralized Hospitality',
      slug: 'welcome-to-aura-future-decentralized-hospitality',
      excerpt: 'Discover how AURA is revolutionizing the hospitality industry through blockchain technology and community ownership.',
      content: `# Welcome to AURA: The Future of Decentralized Hospitality

AURA represents a paradigm shift in how we think about hospitality, travel, and community ownership. Built on blockchain technology, our platform enables travelers to become true stakeholders in the properties they visit.

## What Makes AURA Different?

Unlike traditional hospitality platforms, AURA operates on three core principles:

### 1. Community Ownership
Every AURA token holder becomes a partial owner of our property portfolio. This isn't just symbolic—it means real ownership rights and revenue sharing.

### 2. Transparent Governance
All major decisions about property acquisitions, developments, and operations are voted on by the community. Every voice matters.

### 3. Sustainable Growth
Our 0.8% burn and redistribution mechanism ensures that platform growth directly benefits token holders while funding new property developments.

## The Journey Ahead

We're starting with our flagship property in Costa Rica—a sustainable eco-lodge at the edge of Miravalles Volcano. This is just the beginning of a global network of community-owned stays.

Join us in building the future of hospitality, where travelers become stakeholders and communities thrive together.`,
      categoryId: categories[0].id, // News & Updates
      tags: ['welcome', 'blockchain', 'hospitality', 'community'],
      status: 'PUBLISHED' as const,
      featuredImage: '/A_digital_painting_depicts_a_vineyard_at_sunset_du.png',
    },
    {
      title: 'Understanding the AURA Token Economics',
      slug: 'understanding-aura-token-economics',
      excerpt: 'A deep dive into how our burn and redistribution mechanism creates sustainable value for the community.',
      content: `# Understanding the AURA Token Economics

The AURA token is at the heart of our ecosystem, designed to create sustainable value for all participants. Let's explore how our tokenomics work.

## The 0.8% Burn Mechanism

Every transaction within the AURA ecosystem triggers a 0.8% burn, which is then redistributed to stakers. This creates several benefits:

- **Deflationary pressure**: Reducing token supply over time
- **Reward distribution**: Direct benefits to committed community members
- **Platform funding**: Supporting property acquisitions and development

## Staking Rewards

Token holders can stake their AURA to earn rewards from the burn mechanism. The longer you stake, the higher your reward multiplier:

- 30 days: 1.0x multiplier
- 90 days: 1.2x multiplier  
- 180 days: 1.5x multiplier
- 365 days: 2.0x multiplier

## Property Revenue Sharing

As our property portfolio grows, revenue from bookings is distributed to token holders proportionally to their stake. This creates real utility and value for AURA tokens.

## Future Developments

We're constantly evolving our tokenomics to ensure sustainability and growth. Upcoming features include:

- Governance voting weights based on stake duration
- Property-specific staking pools
- NFT integration for unique experiences

The AURA token isn't just a currency—it's your stake in the future of hospitality.`,
      categoryId: categories[1].id, // Market Insights
      tags: ['tokenomics', 'staking', 'defi', 'rewards'],
      status: 'PUBLISHED' as const,
      featuredImage: '/A_high-resolution_digital_photograph_captures_an_A.png',
    },
    {
      title: 'Building on Solana: Why We Chose Speed and Sustainability',
      slug: 'building-on-solana-speed-sustainability',
      excerpt: 'Exploring why Solana was the perfect blockchain choice for AURA\'s decentralized hospitality platform.',
      content: `# Building on Solana: Why We Chose Speed and Sustainability

When building AURA, we evaluated multiple blockchain platforms. Solana emerged as the clear choice for our decentralized hospitality vision.

## Speed Matters

In hospitality, transactions need to be instant. Whether booking a stay or claiming staking rewards, users expect immediate confirmation. Solana's sub-second finality makes this possible.

## Low Costs, High Accessibility

With transaction fees under $0.01, Solana ensures that platform usage remains accessible to everyone, regardless of transaction size.

## Environmental Responsibility

Solana's proof-of-stake consensus uses 99.9% less energy than proof-of-work networks, aligning with our sustainability mission.

## Developer Experience

Solana's growing ecosystem and robust developer tools enabled us to build features like:

- Real-time burn tracking
- Instant staking rewards
- Seamless wallet integration

## The Road Ahead

We're excited to leverage Solana's continued innovation, including:

- State compression for efficient data storage
- Mobile wallet integration
- Cross-chain compatibility

Solana provides the foundation for AURA to scale globally while maintaining our core values of accessibility and sustainability.`,
      categoryId: categories[2].id, // Technology
      tags: ['solana', 'blockchain', 'technology', 'development'],
      status: 'PUBLISHED' as const,
      featuredImage: '/A_digital_photograph_captures_an_overwater_bungalo.png',
    }
  ]

  for (const postData of samplePosts) {
    const post = await prisma.blogPost.upsert({
      where: { slug: postData.slug },
      update: {
        authorId: admin.id, // Update to Matt Haynes
      },
      create: {
        ...postData,
        authorId: admin.id,
        readTime: Math.ceil(postData.content.split(' ').length / 200), // 200 words per minute
        publishedAt: new Date(),
      },
    })
    console.log('✅ Created/Updated blog post:', post.title)
  }

  console.log('🎉 Seeding completed successfully!')
  console.log('📝 All posts are now authored by Matt Haynes, Founder')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 