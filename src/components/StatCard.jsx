function StatCard({ title, value, icon }) {
  return (
    <div className="bg-yellow-200 p-6 rounded-md flex items-center justify-between hover:scale-105 transition duration-300 ease">
      <div>
        <p className="text-sm text-[#888] font-light mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-[#444]">{value}</h3>
      </div>
      {icon && <span className="text-4xl">{icon}</span>}
    </div>
  );
}

export default StatCard;




