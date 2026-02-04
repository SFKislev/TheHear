import { orderOptionLabels } from "@/utils/sources/getCountryData";
import PopUpCleaner from "@/components/PopUp";
import { TrendingUp, Shield, ArrowRightLeft, ArrowLeftRight, List, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

export default function OrderMenu({ open, close, locale, order, setOrder, centered }) {
    const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);

    const handleSortChange = (event) => {
        setOrder(event.target.value);
    }

    if (!open) return null

    const menuContent = (
        <>
            <PopUpCleaner open={open} close={close} />
            <div className={`fixed z-[9999] ${centered ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : `${locale == 'heb' ? 'left-auto right-auto' : 'right-4'} top-[120px]`} bg-white shadow-xl rounded-lg p-6 pt-4 border border-gray-200`} style={{ direction: 'ltr' }}>
                <div className="w-64 bg-white rounded-sm text-sm">
                    <div className="text-sm underline underline-offset-4 font-bold mb-2 font-['Geist'] flex justify-start items-start">Source Order</div>

                    <div className="mb-2">
                        {Object.keys(orderOptionLabels).map(optionName => (
                            <label key={optionName} className="flex items-center gap-2 py-2 rounded cursor-pointer">
                                <input
                                    type="radio"
                                    name="orderOption"
                                    value={optionName}
                                    checked={order === optionName}
                                    onChange={handleSortChange}
                                    className="w-2 h-2 accent-black"
                                />
                                <div className={`flex items-center px-1 gap-2 text-sm ${order === optionName ? 'text-black' : 'text-gray-400 bg-gray-50 hover:text-gray-700'}`} style={{ fontFamily: "'Geist', sans-serif" }}>
                                    {optionName === 'largest' && <TrendingUp size={16} />}
                                    {optionName === 'mostReputable' && <Shield size={16} />}
                                    {optionName === 'progressiveToConservative' && <ArrowRightLeft size={16} />}
                                    {optionName === 'conservativeToProgressive' && <ArrowLeftRight size={16} />}
                                    {optionName === 'default' && <List size={16} />}
                                    {orderOptionLabels[optionName]}
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="border-t pt-2">
                        <button
                            onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
                            className="flex items-center gap-1 text-sm font-['Geist'] text-gray-600 hover:text-gray-800"
                        >
                            {isExplanationExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            About the sorting options
                        </button>
                        
                        {isExplanationExpanded && (
                            <div className="text-sm font-['Geist'] mt-2 text-gray-600">
                                Sorting the sources can be done through: <br /><br />
                                <div style={{ paddingLeft: '1em' }}>
                                ⟶ <span style={{ fontWeight: '500', textDecoration: 'underline' }}>reputation</span> - the perceived credibility of the source, <br />
                                ⟶ <span style={{ fontWeight: '500', textDecoration: 'underline' }}>circulation</span> - the estimated number of readers, <br />
                                ⟶ <span style={{ fontWeight: '500', textDecoration: 'underline' }}>Left to Right</span> - &quot;progressive&quot; or left-leaning sources at the top, or <br />
                                ⟶ <span style={{ fontWeight: '500', textDecoration: 'underline' }}>Right to Left</span> - &quot;conservative&quot; and right-wing sources at the top; <br />
                                ⟶ The <span style={{ fontWeight: '500', textDecoration: 'underline' }}>default</span> view gives a selection of prominent sources, creating contrasts when possible. <br />
                                </div>
                                <br />
                                <div className="text-xs py-1 font-['Geist']" style={{ color: '#757575' }}>
                                    * Note that all these orders were determined through AI assessments: they are not definitive lists or established rankings.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    return typeof window !== 'undefined' ? createPortal(menuContent, document.body) : null;
};
