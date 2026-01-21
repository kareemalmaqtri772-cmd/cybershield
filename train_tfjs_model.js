const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'tfjs_data');
const MODEL_SAVE_PATH = path.join(__dirname, 'tfjs_model');

async function trainModel() {
    console.log('🚀 بدء تدريب نموذج TensorFlow.js...');

    // تحميل بيانات التدريب والاختبار
    const trainData = JSON.parse(fs.readFileSync(path.join(DATA_PATH, 'train_data.json'), 'utf8'));
    const testData = JSON.parse(fs.readFileSync(path.join(DATA_PATH, 'test_data.json'), 'utf8'));

    const xsTrain = tf.tensor2d(trainData.xs);
    const ysTrain = tf.tensor2d(trainData.ys, [trainData.ys.length, 1]);
    const xsTest = tf.tensor2d(testData.xs);
    const ysTest = tf.tensor2d(testData.ys, [testData.ys.length, 1]);

    // تحديد أبعاد المدخلات
    const inputShape = trainData.xs[0].length;

    // بناء النموذج
    const model = tf.sequential();
    model.add(tf.layers.dense({inputShape: [inputShape], units: 64, activation: 'relu'}));
    model.add(tf.layers.dense({units: 32, activation: 'relu'}));
    model.add(tf.layers.dense({units: 1, activation: 'sigmoid'})); // طبقة إخراج واحدة للتصنيف الثنائي

    // تجميع النموذج
    model.compile({
        optimizer: tf.train.adam(),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    // تدريب النموذج
    const history = await model.fit(xsTrain, ysTrain, {
        epochs: 50, // يمكن تعديل عدد الدورات حسب الحاجة
        validationData: [xsTest, ysTest],
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch + 1}: Loss = ${logs.loss.toFixed(4)}, Accuracy = ${logs.acc.toFixed(4)}, Val Loss = ${logs.val_loss.toFixed(4)}, Val Accuracy = ${logs.val_acc.toFixed(4)}`);
            }
        }
    });

    // حفظ النموذج
    await model.save(`file://${MODEL_SAVE_PATH}`);
    console.log(`✅ تم تدريب النموذج وحفظه في ${MODEL_SAVE_PATH}`);

    // تقييم النموذج النهائي
    const evalResult = model.evaluate(xsTest, ysTest);
    console.log(
        `\nتقييم النموذج النهائي:\n  الخسارة (Loss): ${evalResult[0].dataSync()[0].toFixed(4)}\n  الدقة (Accuracy): ${evalResult[1].dataSync()[0].toFixed(4)}`
    );
}

trainModel().catch(console.error);
