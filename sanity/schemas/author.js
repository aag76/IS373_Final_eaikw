export const author = {
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Author Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "bio",
      title: "Biography",
      type: "text",
      rows: 4,
    },
    {
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) =>
        Rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: "email", invert: false }),
    },
    {
      name: "image",
      title: "Author Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
        },
      ],
    },
    {
      name: "twitter",
      title: "Twitter URL",
      type: "url",
    },
    {
      name: "linkedin",
      title: "LinkedIn URL",
      type: "url",
    },
    {
      name: "github",
      title: "GitHub URL",
      type: "url",
    },
    {
      name: "website",
      title: "Personal Website",
      type: "url",
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
      media: "image",
    },
  },
};
