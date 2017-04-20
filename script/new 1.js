        on(tempLayer, "change", function(){
			
            map.removeLayer(pinpointLayer);
			
			if (FawnControlBox.checked) {
				if (windLayer.checked || rainLayer.checked) {
					windLayer.checked = false;
					rainLayer.checked = false;
					var b = 0;
					while(gl_attr.graphics[b] != null){
						gl_attr_temp.graphics[b].setSymbol(null);
						b++;
					}
				}

			gl_attr_temp.visible = tempLayer.checked;
			if (gl_attr_temp.visible == true) {
				var i = 0;
				while(gl_attr_temp.graphics[i] != null){
					
					var t = new TextSymbol(gl_attr_temp.graphics[i].attributes.temp10mF).setColor("purple").setHaloSize(30);
					t.xoffset = 0;
					t.yoffset = -20;
					gl_attr_temp.graphics[i].setSymbol(t);
					i++;
				}
			
				}else{
					var b = 0;
					while(gl_attr_temp.graphics[b] != null){
						gl_attr_temp.graphics[b].setSymbol(null);
						b++;
					}
		
				}				

			} 
			
			if (FdacswxControlBox.checked) {
				if (windLayer.checked || rainLayer.checked) {
					windLayer.checked = false;
					rainLayer.checked = false;
					var b = 0;
					while(glAttrFdacswxTemp.graphics[b] != null){
					  glAttrFdacswxTemp.graphics[b].setSymbol(null);
					  b++;
					}
				}
				var zoomScale = map.getZoom();
				ZoomInOutScale(glAttrFdacswxTemp, zoomScale);	
				glAttrFdacswxTemp.visible = tempLayer.checked;
				if (glAttrFdacswxTemp.visible == true) {
					var i = 0;
					while(glAttrFdacswxTemp.graphics[i] != null){
						var temp = glAttrFdacswxTemp.graphics[i].attributes.dry_bulb_air_temp;
						
						var t = new TextSymbol(temp).setColor("green").setHaloSize(30);
						t.yoffset = -20;
						glAttrFdacswxTemp.graphics[i].setSymbol(t);
						i++;
					}
				}else{
					var b = 0;
					while(glAttrFdacswxTemp.graphics[b] != null){
						glAttrFdacswxTemp.graphics[b].setSymbol(null);
						b++;
					}
				}				
			} 
        });