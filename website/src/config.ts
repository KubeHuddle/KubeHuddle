export const SITE = {
  title: "KubeHuddle",
  description: "A Kubernetes conference, by and for the community.",
  defaultLanguage: "en_US",
};

export const OPEN_GRAPH = {
  image: {
    src: "https://github.com/withastro/astro/blob/main/assets/social/banner.jpg?raw=true",
    alt:
      "astro logo on a starry expanse of space," +
      " with a purple saturn-like planet floating in the right foreground",
  },
  twitter: "KubeHuddle",
};

// export const GITHUB_EDIT_URL = `https://github.com/KubeHuddle/KubeHuddle/blob/main/website/`;

export const COMMUNITY_INVITE_URL = `https://rawkode.chat`;

export const SIDEBAR = [
  { text: "Conference", header: true },
  { text: "2022", link: "2022" },

  { text: "About Us", header: true },
  { text: "Values", link: "values" },
  { text: "Organizers", link: "organizers" },
];
