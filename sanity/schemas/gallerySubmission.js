export const gallerySubmission = {
  name: "gallerySubmission",
  title: "Gallery Submission",
  type: "document",
  fields: [
    {
      name: "submitterInfo",
      title: "Submitter Information",
      type: "object",
      fields: [
        {
          name: "name",
          title: "Submitter Name",
          type: "string",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "email",
          title: "Email",
          type: "string",
          validation: (Rule) =>
            Rule.required().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: "email", invert: false }),
        },
        {
          name: "website",
          title: "Personal Website",
          type: "url",
        },
      ],
    },
    {
      name: "submissionUrl",
      title: "Submission URL",
      type: "url",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "screenshot",
      title: "Screenshot",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
          validation: (Rule) => Rule.required(),
        },
      ],
      validation: (Rule) => Rule.required(),
    },
    {
      name: "styleReference",
      title: "Design Style Reference",
      type: "reference",
      to: [{ type: "designStyle" }],
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Submission Description",
      type: "text",
      rows: 4,
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Submitted", value: "submitted" },
          { title: "Under Review", value: "under-review" },
          { title: "Approved", value: "approved" },
          { title: "Featured", value: "featured" },
          { title: "Rejected", value: "rejected" },
        ],
        layout: "radio",
      },
      initialValue: "submitted",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "submissionDate",
      title: "Submission Date",
      type: "datetime",
      options: {
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
      },
    },
    {
      name: "reviewNotes",
      title: "Review Notes",
      type: "text",
      rows: 3,
    },
  ],
  preview: {
    select: {
      title: "submitterInfo.name",
      subtitle: "status",
      media: "screenshot",
    },
  },
};
