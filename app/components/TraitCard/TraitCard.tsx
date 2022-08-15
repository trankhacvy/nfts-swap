interface TraitCardProps {
  className?: string;
  property: string;
  value: string;
}

export const TraitCard = (props: TraitCardProps) => {
  const { property, value } = props;

  return (
    <div className="card p-3">
      <div className="text-body2 text-gray-500 mb-1">{property}</div>
      <div className="text-body1 font-semibold">{value}</div>
    </div>
  );
};
