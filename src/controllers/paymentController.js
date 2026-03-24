exports.processPayment = (req, res) => {

    const { amount } = req.body;

    const transactionId = "TXN" + Date.now();

    res.json({
        status: "success",
        message: "Dummy payment successful",
        transactionId: transactionId,
        amount: amount
    });

}