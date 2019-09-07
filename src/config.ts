export default {
  jwt: {
    secretOrKey: 'ziXpA5z480SkpsVqsKX3dhJpp77mrhyu',
    expiresIn: 86400,
  },
  // You can also use any other email sending services
  mail: {
    service: {
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      user: 'apikey',
      pass:
        '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',
    },
    senderCredentials: {
      name: 'e-mece',
      email: 'ceren@e-mece.gsb.gov.tr',
    },
  },
  // these are used in the mail templates
  project: {
    name: 'e-mece',
    address: 'https://e-mece.gov.tr',
    logoUrl: 'https://github.com/e-mece/logo/raw/master/logo.png',
    slogan: 'Made with ❤️ in Genç Hackathon',
    color: '#b40001',
    socials: [['GitHub', 'https://github.com/e-mece/']],
    url: 'https://e-mece.gsb.gov.tr',
    mailVerificationUrl: 'http://localhost:3000/auth/verify',
    mailChangeUrl: 'http://localhost:3000/auth/change-email',
    resetPasswordUrl: 'http://localhost:4200/reset-password',
    termsOfServiceUrl: 'http://localhost:4200/legal/terms',
  },
};
