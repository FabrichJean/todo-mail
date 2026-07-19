export type LibraryTemplate = {
  id: string;
  category: string;
  fr: { name: string; subject: string; body: string };
  en: { name: string; subject: string; body: string };
};

export const TEMPLATE_LIBRARY: LibraryTemplate[] = [
  {
    id: "cold-outreach",
    category: "coldOutreach",
    fr: {
      name: "Premier contact",
      subject: "{{prenom}}, une question rapide sur {{entreprise}}",
      body: "<p>Bonjour {{prenom}},</p><p>Je me permets de vous contacter car j'aide des entreprises comme {{entreprise}} à gagner du temps sur leur prospection.</p><p>Auriez-vous 15 minutes cette semaine pour en discuter ?</p><p>Bien à vous</p>",
    },
    en: {
      name: "First contact",
      subject: "{{prenom}}, a quick question about {{entreprise}}",
      body: "<p>Hi {{prenom}},</p><p>I'm reaching out because I help companies like {{entreprise}} save time on their outreach.</p><p>Would you have 15 minutes this week to chat?</p><p>Best</p>",
    },
  },
  {
    id: "follow-up",
    category: "followUp",
    fr: {
      name: "Relance après premier email",
      subject: "Re : {{prenom}}, toujours partant pour échanger ?",
      body: "<p>Bonjour {{prenom}},</p><p>Je me permets de revenir vers vous suite à mon précédent message — je sais que les journées sont chargées chez {{entreprise}}.</p><p>Ce créneau vous conviendrait-il toujours ?</p><p>Merci d'avance</p>",
    },
    en: {
      name: "Follow-up after first email",
      subject: "Re: {{prenom}}, still open to a quick chat?",
      body: "<p>Hi {{prenom}},</p><p>Following up on my previous message — I know things get busy at {{entreprise}}.</p><p>Would that time slot still work for you?</p><p>Thanks in advance</p>",
    },
  },
  {
    id: "meeting-request",
    category: "meetingRequest",
    fr: {
      name: "Proposition de rendez-vous",
      subject: "{{prenom}}, 20 minutes pour vous présenter notre solution ?",
      body: "<p>Bonjour {{prenom}},</p><p>Suite à nos échanges, je vous propose un créneau de 20 minutes pour vous présenter concrètement comment nous pouvons aider {{entreprise}}.</p><ul><li>Mardi 10h</li><li>Jeudi 14h</li></ul><p>Lequel vous conviendrait ?</p>",
    },
    en: {
      name: "Meeting request",
      subject: "{{prenom}}, 20 minutes to walk you through our solution?",
      body: "<p>Hi {{prenom}},</p><p>Following up on our conversation, here are a couple of 20-minute slots to show you concretely how we can help {{entreprise}}.</p><ul><li>Tuesday 10am</li><li>Thursday 2pm</li></ul><p>Which one works best for you?</p>",
    },
  },
  {
    id: "offer-presentation",
    category: "offerPresentation",
    fr: {
      name: "Présentation de service",
      subject: "Comment {{entreprise}} peut gagner en efficacité",
      body: "<p>Bonjour {{prenom}},</p><p>Nous accompagnons des entreprises comme la vôtre pour :</p><ul><li>Gagner du temps sur les tâches répétitives</li><li>Améliorer le suivi client</li><li>Augmenter le taux de conversion</li></ul><p>Je serais ravi d'échanger sur vos besoins spécifiques chez {{entreprise}}.</p>",
    },
    en: {
      name: "Service presentation",
      subject: "How {{entreprise}} can become more efficient",
      body: "<p>Hi {{prenom}},</p><p>We help companies like yours to:</p><ul><li>Save time on repetitive tasks</li><li>Improve customer follow-up</li><li>Increase conversion rates</li></ul><p>I'd love to discuss your specific needs at {{entreprise}}.</p>",
    },
  },
  {
    id: "post-call-thanks",
    category: "postCallThanks",
    fr: {
      name: "Remerciement après appel",
      subject: "Merci pour votre temps, {{prenom}}",
      body: "<p>Bonjour {{prenom}},</p><p>Merci pour votre temps et pour ces échanges enrichissants sur les enjeux de {{entreprise}}.</p><p>Comme convenu, je reviens vers vous d'ici la fin de semaine avec une proposition adaptée.</p><p>À très vite</p>",
    },
    en: {
      name: "Post-call thank you",
      subject: "Thanks for your time, {{prenom}}",
      body: "<p>Hi {{prenom}},</p><p>Thank you for your time and for the great conversation about {{entreprise}}'s needs.</p><p>As discussed, I'll follow up by the end of the week with a tailored proposal.</p><p>Talk soon</p>",
    },
  },
  {
    id: "re-engagement",
    category: "reEngagement",
    fr: {
      name: "Réactivation prospect inactif",
      subject: "{{prenom}}, toujours d'actualité chez {{entreprise}} ?",
      body: "<p>Bonjour {{prenom}},</p><p>Cela fait un moment que nous ne nous sommes pas parlé — je voulais simplement prendre des nouvelles.</p><p>Les enjeux dont nous avions discuté sont-ils toujours d'actualité chez {{entreprise}} ?</p><p>Ravi de reprendre l'échange si le moment est bon pour vous.</p>",
    },
    en: {
      name: "Re-engaging an inactive prospect",
      subject: "{{prenom}}, still relevant at {{entreprise}}?",
      body: "<p>Hi {{prenom}},</p><p>It's been a while since we last spoke — just wanted to check in.</p><p>Are the challenges we discussed still relevant at {{entreprise}}?</p><p>Happy to pick the conversation back up if the timing works for you.</p>",
    },
  },
  {
    id: "second-follow-up",
    category: "secondFollowUp",
    fr: {
      name: "Deuxième relance",
      subject: "{{prenom}}, je persiste (une dernière fois) 😊",
      body: "<p>Bonjour {{prenom}},</p><p>Je sais que vous êtes sollicité, donc je serai bref : est-ce que ce sujet reste une priorité pour {{entreprise}} en ce moment ?</p><p>Un simple « oui » ou « non » me suffit pour savoir si je dois revenir vers vous plus tard.</p><p>Merci !</p>",
    },
    en: {
      name: "Second follow-up",
      subject: "{{prenom}}, trying one more time",
      body: "<p>Hi {{prenom}},</p><p>I know you're busy, so I'll keep this short: is this still a priority for {{entreprise}} right now?</p><p>A simple yes or no helps me know whether to check back later.</p><p>Thanks!</p>",
    },
  },
  {
    id: "breakup",
    category: "breakup",
    fr: {
      name: "Email de dernière chance",
      subject: "Je referme le dossier {{entreprise}}",
      body: "<p>Bonjour {{prenom}},</p><p>Je n'ai pas eu de retour suite à mes derniers messages, donc je vais partir du principe que ce n'est pas le bon moment pour {{entreprise}}.</p><p>Je referme le dossier de mon côté — n'hésitez pas à revenir vers moi si la situation change, ce sera toujours avec plaisir.</p><p>Bonne continuation</p>",
    },
    en: {
      name: "Last chance / breakup email",
      subject: "Closing the loop on {{entreprise}}",
      body: "<p>Hi {{prenom}},</p><p>I haven't heard back after my last few messages, so I'll assume the timing isn't right for {{entreprise}} at the moment.</p><p>I'll close this out on my end — feel free to reach back out anytime if things change, always happy to reconnect.</p><p>All the best</p>",
    },
  },
  {
    id: "trigger-event",
    category: "triggerEvent",
    fr: {
      name: "Félicitations suite à une actualité",
      subject: "Félicitations pour {{entreprise}} ! 🎉",
      body: "<p>Bonjour {{prenom}},</p><p>Je viens de voir l'actualité de {{entreprise}} — toutes mes félicitations pour cette étape !</p><p>Ce genre de croissance s'accompagne souvent de nouveaux défis côté organisation. Ce serait avec plaisir d'échanger si vous pensez que je peux être utile.</p><p>Encore bravo</p>",
    },
    en: {
      name: "Congratulations on a trigger event",
      subject: "Congrats on {{entreprise}}! 🎉",
      body: "<p>Hi {{prenom}},</p><p>I just saw the news about {{entreprise}} — congratulations on reaching this milestone!</p><p>Growth like this often comes with new operational challenges. Happy to chat if you think I could be useful.</p><p>Congrats again</p>",
    },
  },
  {
    id: "referral-request",
    category: "referral",
    fr: {
      name: "Demande de recommandation",
      subject: "{{prenom}}, une petite question",
      body: "<p>Bonjour {{prenom}},</p><p>Merci encore pour votre confiance chez {{entreprise}} — ça fait toujours plaisir de travailler ensemble.</p><p>Auriez-vous dans votre réseau une personne qui pourrait être intéressée par une approche similaire ? Une simple mise en relation suffirait amplement.</p><p>Merci d'avance !</p>",
    },
    en: {
      name: "Referral request",
      subject: "{{prenom}}, quick favor to ask",
      body: "<p>Hi {{prenom}},</p><p>Thanks again for trusting us at {{entreprise}} — it's always a pleasure working together.</p><p>Do you know anyone in your network who might benefit from a similar approach? A simple introduction would be more than enough.</p><p>Thanks in advance!</p>",
    },
  },
  {
    id: "social-proof",
    category: "socialProof",
    fr: {
      name: "Étude de cas / preuve sociale",
      subject: "Comment une entreprise comme {{entreprise}} a gagné 30% de temps",
      body: "<p>Bonjour {{prenom}},</p><p>Je pensais que ce cas client pourrait vous parler : une entreprise du même secteur que {{entreprise}} a récemment réduit son temps de prospection de 30% grâce à notre approche.</p><p>Je peux vous partager les détails si ça vous intéresse — ça ne prend que 15 minutes.</p><p>Bien à vous</p>",
    },
    en: {
      name: "Case study / social proof",
      subject: "How a company like {{entreprise}} saved 30% of their time",
      body: "<p>Hi {{prenom}},</p><p>Thought this case study might resonate: a company in the same space as {{entreprise}} recently cut their outreach time by 30% with our approach.</p><p>Happy to share the details if you're curious — just a 15-minute chat.</p><p>Best</p>",
    },
  },
  {
    id: "event-invite",
    category: "eventInvite",
    fr: {
      name: "Invitation à un webinaire",
      subject: "{{prenom}}, une invitation qui pourrait vous intéresser",
      body: "<p>Bonjour {{prenom}},</p><p>Nous organisons un webinaire sur les bonnes pratiques de prospection, et je pense que ça pourrait intéresser quelqu'un chez {{entreprise}}.</p><p>C'est gratuit, ça dure 30 minutes, et je vous envoie le lien avec plaisir si vous voulez participer.</p><p>Au plaisir de vous y voir !</p>",
    },
    en: {
      name: "Webinar invitation",
      subject: "{{prenom}}, an invite you might like",
      body: "<p>Hi {{prenom}},</p><p>We're hosting a webinar on outreach best practices, and I thought it might be relevant for someone at {{entreprise}}.</p><p>It's free, 30 minutes long, and I'm happy to send over the link if you'd like to join.</p><p>Hope to see you there!</p>",
    },
  },
  {
    id: "resource-share",
    category: "resourceShare",
    fr: {
      name: "Partage d'une ressource utile",
      subject: "Une ressource qui pourrait aider {{entreprise}}",
      body: "<p>Bonjour {{prenom}},</p><p>En pensant aux enjeux de {{entreprise}}, je me suis dit que ce guide pourrait vous être utile — aucune contrepartie attendue, juste un partage.</p><p>N'hésitez pas à me dire ce que vous en pensez si vous avez l'occasion d'y jeter un œil.</p><p>Bonne lecture</p>",
    },
    en: {
      name: "Helpful resource share",
      subject: "A resource that might help {{entreprise}}",
      body: "<p>Hi {{prenom}},</p><p>Thinking about {{entreprise}}'s challenges, I figured this guide might be useful — no strings attached, just sharing.</p><p>Let me know what you think if you get a chance to check it out.</p><p>Enjoy the read</p>",
    },
  },
  {
    id: "objection-handling",
    category: "objectionHandling",
    fr: {
      name: "Réponse à une objection",
      subject: "Re : {{prenom}}, je comprends tout à fait",
      body: "<p>Bonjour {{prenom}},</p><p>Je comprends que le moment ne soit pas idéal pour {{entreprise}} — merci d'avoir pris le temps de me le dire.</p><p>Pour info, beaucoup de nos clients actuels avaient la même hésitation au départ. Si utile, je peux vous partager comment ils ont abordé la question.</p><p>Pas de pression, je reste disponible quand vous le souhaitez.</p>",
    },
    en: {
      name: "Objection handling",
      subject: "Re: {{prenom}}, totally understand",
      body: "<p>Hi {{prenom}},</p><p>I understand the timing isn't ideal for {{entreprise}} right now — thanks for letting me know.</p><p>For what it's worth, many of our current customers had the same hesitation at first. Happy to share how they approached it if useful.</p><p>No pressure at all, I'm here whenever works for you.</p>",
    },
  },
  {
    id: "free-trial",
    category: "freeTrial",
    fr: {
      name: "Offre d'essai gratuit",
      subject: "{{prenom}}, testez sans engagement",
      body: "<p>Bonjour {{prenom}},</p><p>Plutôt que de vous convaincre par mail, pourquoi ne pas tester directement ? Je peux activer un essai gratuit de 14 jours pour {{entreprise}}, sans carte bancaire ni engagement.</p><p>Dites-moi si ça vous tente, je m'occupe de tout.</p><p>À bientôt</p>",
    },
    en: {
      name: "Free trial offer",
      subject: "{{prenom}}, try it risk-free",
      body: "<p>Hi {{prenom}},</p><p>Rather than convincing you over email, why not try it yourself? I can set up a 14-day free trial for {{entreprise}}, no card required, no commitment.</p><p>Let me know if you're interested and I'll take care of everything.</p><p>Talk soon</p>",
    },
  },
];
