import { BadgePercent, Gauge, ShieldCheck, Star } from "lucide-react";
import type { ReactNode } from "react";

type Service = {
  title: string;
  subTitle: string;
  icon: ReactNode;
};
const services: Service[] = [
  {
    title: "Quick delivery",
    subTitle: "Right to your doorstep",
    icon: <Gauge size={40} />,
  },
  {
    title: "Secure Payment",
    subTitle: "All your payments are secure",
    icon: <ShieldCheck size={40} />,
  },
  {
    title: "Best Quality",
    subTitle: "All books are of high quality",
    icon: <Star size={36} />,
  },

  {
    title: "Promo codes",
    subTitle: "Get amazing discounts",
    icon: <BadgePercent size={40} />,
  },
];
export default function OurServices() {
  return (
    <div className="bg-primary container mx-auto my-24 grid cursor-default grid-cols-1 gap-8 rounded-lg p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {services.map((service, index) => (
        <div className="flex w-full items-center gap-4" key={index}>
          <div className="bg-hover flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-lg text-white">
            {service.icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{service.title}</h3>
            <p className="text-accent">{service.subTitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
