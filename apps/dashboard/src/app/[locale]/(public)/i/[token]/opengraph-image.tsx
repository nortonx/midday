import { OgTemplate, isValidLogoUrl } from "@midday/invoice";
import { verify } from "@midday/invoice/token";
import { getInvoiceQuery } from "@midday/supabase/queries";
import { createClient } from "@midday/supabase/server";
import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const runtime = "edge";

const CDN_URL = "https://cdn.midday.ai";

export default async function Image({ params }: { params: { token: string } }) {
  const supabase = createClient({ admin: true });

  const { id } = await verify(params.token);
  const { data: invoice } = await getInvoiceQuery(supabase, id);

  const geistMonoRegular = fetch(
    `${CDN_URL}/fonts/GeistMono/og/GeistMono-Regular.otf`,
  ).then((res) => res.arrayBuffer());

  const geistSansRegular = fetch(
    `${CDN_URL}/fonts/Geist/og/Geist-Regular.otf`,
  ).then((res) => res.arrayBuffer());

  const logoUrl = `https://img.logo.dev/${invoice.customer?.website}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ&size=60`;

  const isValidLogo = await isValidLogoUrl(logoUrl);

  return new ImageResponse(
    <OgTemplate
      {...invoice}
      name={invoice.customer_name || invoice.customer?.name}
      isValidLogo={isValidLogo}
      logoUrl={logoUrl}
    />,
    {
      ...size,
      fonts: [
        {
          name: "GeistMono",
          data: await geistMonoRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "GeistSans",
          data: await geistSansRegular,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
