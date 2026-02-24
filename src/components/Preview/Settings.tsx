import React, { useState } from "react";
import { LabelledColorPicker } from "@/components/molecules/LabelledColorPicker";

const Settings: React.FC = () => {
    const [primaryColor, setPrimaryColor] = useState("#444cf7");
    const [secondaryColor, setSecondaryColor] = useState("#e5e5f7");

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">Colors</h2>
                <div className="flex flex-col gap-4">
                    <LabelledColorPicker
                        label="Primary Color"
                        value={primaryColor}
                        onChange={setPrimaryColor}
                    />
                    <LabelledColorPicker
                        label="Secondary Color"
                        value={secondaryColor}
                        onChange={setSecondaryColor}
                    />
                </div>
            </div>
        </div>
    );
};

export default Settings;