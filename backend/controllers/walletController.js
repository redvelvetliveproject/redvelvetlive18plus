// Demo: devuelve un balance fijo
export const getBalance = async (req, res) => {
  try {
    res.json({
      address: "0x1111111111111111111111111111111111111111",
      balance: "500.00",
      symbol: "ONECOP",
      usdtValue: "6.00"
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo obtener balance" });
  }
};

