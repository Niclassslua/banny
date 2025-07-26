import React, { useState } from "react";
import ColorPicker from "../shared/ColorPicker";

const Settings: React.FC = () => {
    const [primaryColor, setPrimaryColor] = useState("#444cf7");
    const [secondaryColor, setSecondaryColor] = useState("#e5e5f7");

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">Colors</h2>
                <div className="flex flex-col gap-4">
                    <ColorPicker
                        label="Primary Color"
                        color={primaryColor}
                        onChange={setPrimaryColor}
                    />
                    <ColorPicker
                        label="Secondary Color"
                        color={secondaryColor}
                        onChange={setSecondaryColor}
                    />
                </div>
            </div>
        </div>
    );
};

export default Settings;