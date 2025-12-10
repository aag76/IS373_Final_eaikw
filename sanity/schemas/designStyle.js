export const designStyle = {
  name: "designStyle",
  title: "Design Style",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    },
    {
      name: "historicalBackground",
      title: "Historical Background",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "colorPalette",
      title: "Color Palette",
      type: "array",
      of: [
        {
          type: "object",
          title: "Color",
          fields: [
            {
              name: "name",
              title: "Color Name",
              type: "string",
            },
            {
              name: "hexCode",
              title: "Hex Code",
              type: "string",
            },
            {
              name: "usage",
              title: "Usage",
              type: "text",
              rows: 2,
            },
          ],
        },
      ],
    },
    {
      name: "typographyGuidance",
      title: "Typography Guidance",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "sampleImages",
      title: "Sample Images",
      type: "array",
      of: [
        {
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
            {
              name: "caption",
              title: "Caption",
              type: "string",
            },
          ],
        },
      ],
    },
    {
      name: "gallerySubmissions",
      title: "Gallery Submissions",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "gallerySubmission" }],
        },
      ],
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      options: {
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
      },
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
  },
};
